const { BigNumber, utils } = require('ethers');

const abiCoder = new utils.AbiCoder();

const CONSTRUCTOR = 'constructor';

const sha3 = (str) => utils.keccak256(utils.toUtf8Bytes(str));

const typeToString = (input) => {
  if (input.type === 'tuple') {
    return `(${input.components.map(typeToString).join(',')})`;
  }
  return input.type;
};

const extractMethods = (abiArray) => {
  const methodIDs = {};

  // Iterate new abi to generate method id"s
  abiArray.map(function (abi) {
    if (abi.name) {
      const inputsConcat = abi.inputs.map(typeToString).join(',');
      const signature = sha3(`${abi.name}(${inputsConcat})`);

      if (abi.type === 'event') {
        methodIDs[signature.slice(2)] = abi;
      } else {
        methodIDs[signature.slice(2, 10)] = abi;
      }
    } else if (abi.type === 'constructor') {
      methodIDs[CONSTRUCTOR] = abi;
    }
  });

  return methodIDs;
};

const decode = (abiItem, dataSlice) => {
  const decoded = abiCoder.decode(abiItem.inputs, dataSlice);

  const retData = {
    name: abiItem.name ? abiItem.name : CONSTRUCTOR,
    params: [],
  };

  for (let i = 0; i < decoded.length; i++) {
    const param = decoded[i];
    let parsedParam = param;
    const isUint = abiItem.inputs[i].type.indexOf('uint') === 0;
    const isInt = abiItem.inputs[i].type.indexOf('int') === 0;
    const isAddress = abiItem.inputs[i].type.indexOf('address') === 0;

    if (isUint || isInt) {
      const isArray = Array.isArray(param);

      if (isArray) {
        parsedParam = param.map((val) => BigNumber.from(val).toString());
      } else {
        parsedParam = BigNumber.from(param).toString();
      }
    }

    // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
    if (isAddress) {
      const isArray = Array.isArray(param);

      if (isArray) {
        parsedParam = param.map((_) => _.toLowerCase());
      } else {
        parsedParam = param.toLowerCase();
      }
    }

    retData.params.push({
      name: abiItem.inputs[i].name,
      value: parsedParam,
      type: abiItem.inputs[i].type,
    });
  }

  return retData;
};

const decodeContractCreation = (abiItem, txRawData, contactByteCode) => {
  const argInx =
    txRawData.indexOf(contactByteCode.slice(2)) + contactByteCode.length - 2;
  const constructorCallData = txRawData.slice(argInx);
  // return decode(abiItem, constructorCallData);
  return decode(abiItem, `0x${constructorCallData}`);
};

const decodeMethodCall = (abiItem, data) => {
  return decode(abiItem, `0x${data.slice(10)}`);
};

const getAbiItemForMethod = (methodIDs, data) => {
  const methodID = data.slice(2, 10);
  const abiItem = methodIDs[methodID];
  if (!abiItem) {
    throw new Error('data does not match any of the abi methods');
  }
  return abiItem;
};

const decodeLogs = (methodIDs, logs) => {
  return logs
    .filter((log) => log.topics.length > 0)
    .map((logItem) => {
      const methodID = logItem.topics[0].slice(2);
      const method = methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        const decodedParams = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        const dataTypes = [];
        method.inputs.map(function (input) {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        });

        const decodedData = abiCoder.decode(dataTypes, logData);

        // Loop topic and data to get the params
        method.inputs.map(function (param) {
          const decodedP = {
            name: param.name,
            type: param.type,
          };

          if (param.indexed) {
            decodedP.value = logItem.topics[topicsIndex];
            topicsIndex++;
          } else {
            decodedP.value = decodedData[dataIndex];
            dataIndex++;
          }

          if (param.type === 'address') {
            decodedP.value = decodedP.value.toLowerCase();
            // 42 because len(0x) + 40
            if (decodedP.value.length > 42) {
              const toRemove = decodedP.value.length - 42;
              const temp = decodedP.value.split('');
              temp.splice(2, toRemove);
              decodedP.value = temp.join('');
            }
          }

          if (
            param.type === 'uint256' ||
            param.type === 'uint8' ||
            param.type === 'int'
          ) {
            // ensure to remove leading 0x for hex numbers
            if (
              typeof decodedP.value === 'string' &&
              decodedP.value.startsWith('0x')
            ) {
              decodedP.value = BigNumber.from(
                decodedP.value.slice(2),
                16,
              ).toString(10);
            } else {
              decodedP.value = BigNumber.from(decodedP.value).toString(10);
            }
          }

          decodedParams.push(decodedP);
        });

        return {
          name: method.name,
          events: decodedParams,
          address: logItem.address,
        };
      }
    });
};

function encoderDecoder(abiDefinition) {
  const abiArr = Array.isArray(abiDefinition)
    ? abiDefinition
    : JSON.parse(abiDefinition);
  const methodIDs = extractMethods(abiArr);

  return {
    getABIs: () => abiArr,
    getMethodIDs: () => methodIDs,
    decodeContractCreation: (txRawData, contactByteCode) =>
      decodeContractCreation(
        methodIDs[CONSTRUCTOR],
        txRawData,
        contactByteCode,
      ),
    decodeContractCall: (constructorCallData) =>
      decode(methodIDs[CONSTRUCTOR], constructorCallData),
    decodeMethod: (data) =>
      decodeMethodCall(getAbiItemForMethod(methodIDs, data), data),
    decodeLogs: (logs) => decodeLogs(methodIDs, logs),
  };
}

module.exports = encoderDecoder;

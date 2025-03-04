const { expect } = require('chai');
const { BigNumber } = require('ethers');

const abiDecoder = require('../encoder-decoder');
const testContracts = require('./constants');

describe('abi decoder for Constructors', function () {
  it('decodes pepe', () => {
    const newDec = abiDecoder(testContracts.pepe.abi);
    const decodedData = newDec.decodeContractCreation(
      testContracts.pepe.txRaw,
      testContracts.pepe.byteCode,
    );
    console.log(decodedData.params);
  });

  it('decodes qrblocks', () => {
    const newDec = abiDecoder(testContracts.qrblocks.abi);
    const decodedData = newDec.decodeContractCreation(
      testContracts.qrblocks.txRaw,
      testContracts.qrblocks.byteCode,
    );
    console.log(decodedData.params);
  });

  it('decodes bitcoin', () => {
    const newDec = abiDecoder(testContracts.bitcoin.abi);
    const decodedData = newDec.decodeContractCreation(
      testContracts.bitcoin.txRaw,
      testContracts.bitcoin.byteCode,
    );
    console.log(decodedData.params);
  });

  it('decodes political', () => {
    const newDec = abiDecoder(testContracts.political.abi);
    const decodedData = newDec.decodeContractCreation(
      testContracts.political.txRaw,
      testContracts.political.byteCode,
    );
    console.log(decodedData.params);
  });

  it('decodes token: constructor with no args', () => {
    const newDec = abiDecoder(testContracts.token.abi);
    const decodedData = newDec.decodeContractCreation(
      testContracts.token.txRaw,
      testContracts.token.byteCode,
    );
    console.log(decodedData);
  });
});

describe('abi decoder for methods', function () {
  it('decode data for ABIEncoderV2 abi', () => {
    const decoder = abiDecoder(testContracts.abiV2.abi);
    const testData =
      '0xd4f8f1310000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000050a5cf333fc36a18c8f96b1d1e7a2b013c6267ac000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046dccf96fe3f3beef51c72c68a1f3ad9183a6561000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000254dffcd3277c0b1660f6d42efbb754edababc2b00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000059682f000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000642ac0df260000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000411de3d1ce0d680d92171da7852a1df1a655280126d809b6f10d046a60e257c187684da02cf3fb67e6939ac48459e26f6c0bfdedf70a1e8f6921a4a0ff331448641b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const decodedData = decoder.decodeMethod(testData);
    expect(decodedData).to.be.an('object');
    expect(decodedData).to.have.all.keys('name', 'params');
    expect(decodedData.name).to.be.a('string');
    expect(decodedData.params).to.be.a('array');
    expect(decodedData.params).to.have.length(3);

    expect(decodedData.params[0].value[0][0]).to.equal(
      '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
    );
    expect(decodedData.params[0].value[0][1]).to.deep.equal(
      BigNumber.from(1000000),
    );
    expect(decodedData.params[0].value[0][2]).to.deep.equal(
      BigNumber.from(24000000000),
    );
    expect(decodedData.params[0].value[0][3]).to.equal(
      '0x2ac0df260000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000',
    );

    expect(decodedData.params[0].value[1][0]).to.equal(
      '0x50A5cf333FC36A18c8F96B1D1e7a2B013C6267aC',
    );
    expect(decodedData.params[0].value[1][1]).to.deep.equal(BigNumber.from(0));
    expect(decodedData.params[0].value[1][2]).to.equal(
      '0x46DCcF96Fe3f3bEEf51c72c68A1F3Ad9183a6561',
    );
    expect(decodedData.params[0].value[1][3]).to.deep.equal(BigNumber.from(12));
  });

  it('decode data', () => {
    const decoder = abiDecoder(testContracts.testABI.abi);
    const testData =
      '0x53d9d9100000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114de5000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114daa';
    const decodedData = decoder.decodeMethod(testData);
    expect(decodedData).to.be.an('object');
    expect(decodedData).to.have.all.keys('name', 'params');
    expect(decodedData.name).to.be.a('string');
    expect(decodedData.params).to.be.a('array');
    expect(decodedData.params).to.have.length(3);
    expect(decodedData.params[0].value).to.deep.equal([
      '0xa6d9c5f7d4de3cef51ad3b7235d79ccc95114de5',
      '0xa6d9c5f7d4de3cef51ad3b7235d79ccc95114daa',
    ]);
    expect(decodedData.params[0].name).to.equal('_owners');
    expect(decodedData.params[0].type).to.equal('address[]');
    expect(decodedData.params[1].value).to.equal('1');
    expect(decodedData.params[1].name).to.equal('_required');
    expect(decodedData.params[1].type).to.equal('uint256');
    expect(decodedData.params[2].value).to.equal('0');
    expect(decodedData.params[2].name).to.equal('_dailyLimit');
    expect(decodedData.params[2].type).to.equal('uint256');
  });

  it('decode data with arrays', () => {
    const decoder = abiDecoder(testContracts.testArrNumbersABI.abi);
    const testData =
      '0x3727308100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003';
    const decodedData = decoder.decodeMethod(testData);
    expect(decodedData).to.be.an('object');
    expect(decodedData).to.have.all.keys('name', 'params');
    expect(decodedData.name).to.be.a('string');
    expect(decodedData.params).to.be.a('array');
    expect(decodedData.params).to.have.length(1);
    expect(decodedData.params[0].value[0]).to.equal('1');
    expect(decodedData.params[0].value[1]).to.equal('2');
    expect(decodedData.params[0].value[2]).to.equal('3');
    expect(decodedData.params[0].name).to.equal('n');
    expect(decodedData.params[0].type).to.equal('uint256[]');
  });
});

describe('abi decoder for logs', function () {
  it('decode logs with indexed param', () => {
    const walletABI = [
      {
        inputs: [{ type: 'uint256', name: '' }],
        constant: true,
        name: 'owners',
        payable: false,
        outputs: [{ type: 'address', name: '' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'address', name: 'owner' }],
        constant: false,
        name: 'removeOwner',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: false,
        name: 'revokeConfirmation',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [{ type: 'address', name: '' }],
        constant: true,
        name: 'isOwner',
        payable: false,
        outputs: [{ type: 'bool', name: '' }],
        type: 'function',
      },
      {
        inputs: [
          { type: 'uint256', name: '' },
          { type: 'address', name: '' },
        ],
        constant: true,
        name: 'confirmations',
        payable: false,
        outputs: [{ type: 'bool', name: '' }],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'calcMaxWithdraw',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [
          { type: 'bool', name: 'pending' },
          { type: 'bool', name: 'executed' },
        ],
        constant: true,
        name: 'getTransactionCount',
        payable: false,
        outputs: [{ type: 'uint256', name: 'count' }],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'dailyLimit',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'lastDay',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'address', name: 'owner' }],
        constant: false,
        name: 'addOwner',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: true,
        name: 'isConfirmed',
        payable: false,
        outputs: [{ type: 'bool', name: '' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: true,
        name: 'getConfirmationCount',
        payable: false,
        outputs: [{ type: 'uint256', name: 'count' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: '' }],
        constant: true,
        name: 'transactions',
        payable: false,
        outputs: [
          { type: 'address', name: 'destination' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
          { type: 'bool', name: 'executed' },
        ],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'getOwners',
        payable: false,
        outputs: [{ type: 'address[]', name: '' }],
        type: 'function',
      },
      {
        inputs: [
          { type: 'uint256', name: 'from' },
          { type: 'uint256', name: 'to' },
          { type: 'bool', name: 'pending' },
          { type: 'bool', name: 'executed' },
        ],
        constant: true,
        name: 'getTransactionIds',
        payable: false,
        outputs: [{ type: 'uint256[]', name: '_transactionIds' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: true,
        name: 'getConfirmations',
        payable: false,
        outputs: [{ type: 'address[]', name: '_confirmations' }],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'transactionCount',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: '_required' }],
        constant: false,
        name: 'changeRequirement',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: false,
        name: 'confirmTransaction',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [
          { type: 'address', name: 'destination' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
        ],
        constant: false,
        name: 'submitTransaction',
        payable: false,
        outputs: [{ type: 'uint256', name: 'transactionId' }],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: '_dailyLimit' }],
        constant: false,
        name: 'changeDailyLimit',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'MAX_OWNER_COUNT',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'required',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [
          { type: 'address', name: 'owner' },
          { type: 'address', name: 'newOwner' },
        ],
        constant: false,
        name: 'replaceOwner',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [{ type: 'uint256', name: 'transactionId' }],
        constant: false,
        name: 'executeTransaction',
        payable: false,
        outputs: [],
        type: 'function',
      },
      {
        inputs: [],
        constant: true,
        name: 'spentToday',
        payable: false,
        outputs: [{ type: 'uint256', name: '' }],
        type: 'function',
      },
      {
        inputs: [
          { type: 'address[]', name: '_owners' },
          { type: 'uint256', name: '_required' },
          { type: 'uint256', name: '_dailyLimit' },
        ],
        type: 'constructor',
      },
      { payable: true, type: 'fallback' },
      {
        inputs: [{ indexed: false, type: 'uint256', name: 'dailyLimit' }],
        type: 'event',
        name: 'DailyLimitChange',
        anonymous: false,
      },
      {
        inputs: [
          { indexed: true, type: 'address', name: 'sender' },
          { indexed: true, type: 'uint256', name: 'transactionId' },
        ],
        type: 'event',
        name: 'Confirmation',
        anonymous: false,
      },
      {
        inputs: [
          { indexed: true, type: 'address', name: 'sender' },
          { indexed: true, type: 'uint256', name: 'transactionId' },
        ],
        type: 'event',
        name: 'Revocation',
        anonymous: false,
      },
      {
        inputs: [{ indexed: true, type: 'uint256', name: 'transactionId' }],
        type: 'event',
        name: 'Submission',
        anonymous: false,
      },
      {
        inputs: [{ indexed: true, type: 'uint256', name: 'transactionId' }],
        type: 'event',
        name: 'Execution',
        anonymous: false,
      },
      {
        inputs: [{ indexed: true, type: 'uint256', name: 'transactionId' }],
        type: 'event',
        name: 'ExecutionFailure',
        anonymous: false,
      },
      {
        inputs: [
          { indexed: true, type: 'address', name: 'sender' },
          { indexed: false, type: 'uint256', name: 'value' },
        ],
        type: 'event',
        name: 'Deposit',
        anonymous: false,
      },
      {
        inputs: [{ indexed: true, type: 'address', name: 'owner' }],
        type: 'event',
        name: 'OwnerAddition',
        anonymous: false,
      },
      {
        inputs: [{ indexed: true, type: 'address', name: 'owner' }],
        type: 'event',
        name: 'OwnerRemoval',
        anonymous: false,
      },
      {
        inputs: [{ indexed: false, type: 'uint256', name: 'required' }],
        type: 'event',
        name: 'RequirementChange',
        anonymous: false,
      },
    ];
    const decoder = abiDecoder(walletABI);
    const testLogs = [
      {
        data: '0x00000000000000000000000000000000000000000000000000038d7ea4c68000',
        topics: [
          '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
          '0x00000000000000000000000005039084cc6f4773291a6ed7dcf5bc3a2e894ff3',
        ],
        address: '0x0457874Bb0a346962128a0C01310d00Fc5bb6a81',
      },
    ];
    const decodedLogs = decoder.decodeLogs(testLogs);
    expect(decodedLogs).to.be.an('array');
    expect(decodedLogs).to.have.length(1);
    expect(decodedLogs[0].name).to.equal('Deposit');
    expect(decodedLogs[0].events).to.have.length(2);
    expect(decodedLogs[0].address).to.equal(
      '0x0457874Bb0a346962128a0C01310d00Fc5bb6a81',
    );
    expect(decodedLogs[0].events[0].name).to.equal('sender');
    expect(decodedLogs[0].events[0].type).to.equal('address');
    expect(decodedLogs[0].events[0].value).to.equal(
      '0x05039084cc6f4773291a6ed7dcf5bc3a2e894ff3',
    );
    expect(decodedLogs[0].events[1].name).to.equal('value');
    expect(decodedLogs[0].events[1].value).to.equal('1000000000000000');
    expect(decodedLogs[0].events[1].type).to.equal('uint256');
  });
});

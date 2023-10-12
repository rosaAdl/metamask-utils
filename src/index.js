import MetaMaskOnboarding from '@metamask/onboarding';
// eslint-disable-next-line camelcase
import { ethers, utils } from 'ethers';
import rj from 'renderjson';

import decoder from './abi-decoding-utils/encoder-decoder';

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;
const urlSearchParams = new URLSearchParams(window.location.search);
let deployedContractAddress = urlSearchParams.get('contract');
if (!ethers.utils.isAddress(deployedContractAddress)) {
  deployedContractAddress = '';
}

const scrollTo = urlSearchParams.get('scrollTo');

const { isMetaMaskInstalled } = MetaMaskOnboarding;

// Dapp Status Section
const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResults = document.getElementById('getAccountsResult');

// Figment Actions Section
// Figment Restful:
const restfulSign = document.getElementById('restfulSignTxButton');
const restfulSignTxResult = document.getElementById('restfulSignTxResult');
const restfulFromInput = document.getElementById('restfulFromInput');
const restfulToInput = document.getElementById('restfulToInput');
const restfulAmountInput = document.getElementById('restfulAmountInput');
const restfulRawDataInput = document.getElementById('restfulRawDataInput');

// Figment Slate:
const slateSign = document.getElementById('signSlateTxButton');
const slateSignResult = document.getElementById('slateSignResult');
const rawSlateTx = document.getElementById('rawSlateTx');

// Figment Sign only
const messageSignButton = document.getElementById('signMessageBtn');
const messageSignResult = document.getElementById('messageSignResult');
const messageToSignInput = document.getElementById('messageToSign');

// Decoder:
const abiInput = document.getElementById('abis');
const txRawHexInput = document.getElementById('txRawHex');
const bytecodeInput = document.getElementById('bytecode');
const contractCreationDecoderButton = document.getElementById(
  'decodeContractCreation',
);
const decodeMethodCallButton = document.getElementById('decodeMethodCall');
const decodedResultRenderer = document.getElementById('jsonRender');
const decodeErrors = document.getElementById('getDecodeErrors');
const decodeErrorWrapper = document.getElementById('decodeErrorWrapper');

const initialize = async () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  let accounts;
  let accountButtonsInitialized = false;
  let scrollToHandled = false;

  const accountButtons = [restfulSign, slateSign, messageSignButton];

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress';
    onboardButton.disabled = true;
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      handleNewAccounts(newAccounts);
    } catch (error) {
      console.error(error);
    }
  };

  const updateButtons = () => {
    const accountButtonsDisabled =
      !isMetaMaskInstalled() || !isMetaMaskConnected();
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true;
      }
    } else {
      restfulSign.disabled = false;
    }

    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!';
      onboardButton.onclick = onClickInstall;
      onboardButton.disabled = false;
    }

    if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected';
      onboardButton.disabled = true;
      if (onboarding) {
        onboarding.stopOnboarding();
      }
    } else {
      onboardButton.innerText = 'Connect';
      onboardButton.onclick = onClickConnect;
      onboardButton.disabled = false;
    }
  };

  /**
   * Contract Creation Decode
   */
  const abiInputToJsonObj = (abiVal) => {
    const sanitizedAbi = abiVal.trim().replace(/(\r\n|\n|\r)/gm, '');
    try {
      console.log(sanitizedAbi);
      return JSON.parse(sanitizedAbi);
    } catch (err) {
      // Now try it with adding quotes:
      const abiJsonStr = sanitizedAbi
        .replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
          return `'${matchedStr.substring(0, matchedStr.length - 1)}':`;
        })
        .replace(/(')/gm, '"')
        .replace(/,([ |\t|\n]+[\}|\]|\)])/g, '$1');
      console.log(abiJsonStr);
      return JSON.parse(abiJsonStr);
      // Here it will throw if the data is not good but we will handle it
    }
  };

  const renderDecodedData = (decodedData) => {
    rj.set_icons('+', '-').set_show_to_level(2);
    if (decodedResultRenderer.childElementCount === 0) {
      decodedResultRenderer.appendChild(rj(decodedData));
    } else {
      decodedResultRenderer.replaceChildren(rj(decodedData));
    }
  };

  const handleDecodeErrors = (err) => {
    decodeErrors.innerHTML = `Error: ${err.message}`;
    decodeErrorWrapper.hidden = false;
    if (decodedResultRenderer.childElementCount > 0) {
      decodedResultRenderer.removeChild(decodedResultRenderer.children[0]);
    }
  };

  contractCreationDecoderButton.onclick = async () => {
    // Get values
    try {
      decodeErrorWrapper.hidden = true;
      const abi = abiInput.value.trim();
      const rawTx = txRawHexInput.value.trim();
      const bytecode = bytecodeInput.value.trim();

      console.log(abi);
      // validations TODO:
      if (abi.length === 0) {
        throw new Error('Abi is required and it must be a Json string.');
      }

      if (rawTx.length === 0) {
        throw new Error(
          'Transaction data (TX Raw Hex) is mandatory and must start with 0x',
        );
      }

      if (bytecode.length === 0) {
        throw new Error(
          'To decode contract creation, we need the bytecode of the contract and it must start with 0x',
        );
      }

      const decoderForABI = decoder(abiInputToJsonObj(abi));
      const decodedData = decoderForABI.decodeContractCreation(rawTx, bytecode);

      renderDecodedData({ name: 'constructor', params: decodedData.params });
    } catch (err) {
      handleDecodeErrors(err);
    }
  };

  decodeMethodCallButton.onclick = async () => {
    // Get values
    try {
      decodeErrorWrapper.hidden = true;
      const abi = abiInput.value.trim();
      const rawTx = txRawHexInput.value.trim();

      // validations TODO:
      if (abi.length === 0) {
        throw new Error('Abi is required and it must be a Json string.');
      }

      if (rawTx.length === 0) {
        throw new Error(
          'Transaction data (TX Raw Hex) is mandatory and must start with 0x',
        );
      }

      // Call Decoder: TODO
      const decoderForABI = decoder(abiInputToJsonObj(abi));
      const decodedData = decoderForABI.decodeMethod(rawTx);

      renderDecodedData(decodedData);
    } catch (err) {
      handleDecodeErrors(err);
    }
  };

  const initializeAccountButtons = () => {
    if (accountButtonsInitialized) {
      return;
    }
    accountButtonsInitialized = true;

    /**
     * Figment Restful Staking
     */

    restfulSign.onclick = async () => {
      // Get values
      const from = restfulFromInput.value;
      const to = restfulToInput.value;
      const amount = restfulAmountInput.value;
      const rawData = restfulRawDataInput.value;

      // validations:
      if (from.length !== 42 || !utils.isAddress(from)) {
        restfulSignTxResult.innerHTML = `From: '${from}' is not a valid ethereum address.`;
        return;
      }

      if (to.length !== 42 || !utils.isAddress(to)) {
        restfulSignTxResult.innerHTML = `To: '${to}' is not a valid ethereum address.`;
        return;
      }

      if (amount.length === 0 || !parseInt(amount, 10)) {
        restfulSignTxResult.innerHTML = `Amount: '${amount}' is not valid.`;
        return;
      }

      const params = [
        {
          from: accounts[0], // The user's active address.
          to,
          value: `0x${parseInt(amount, 10).toString(16)}`,
          data: rawData,
        },
      ];

      try {
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params,
        });
        restfulSignTxResult.innerHTML = txHash;
      } catch (err) {
        console.error(err);
        restfulSignTxResult.innerHTML = `Error: ${err.message}`;
      }
    };

    /**
     * Figment Slate
     */
    rawSlateTx.onkeyup = () => {
      if (slateSign.disabled && rawSlateTx.value.length > 0) {
        slateSign.disabled = false;
      } else if (!slateSign.disabled && rawSlateTx.value.length === 0) {
        slateSign.disabled = true;
      }
    };

    slateSign.onclick = async () => {
      const DEPOSIT_METHOD_ID = '0x4f498c73';
      // const slate_payload = '0x02f902d705038459682f008459682f10830155779494a2da805867c962148d3832d9afc512034a62c58901bc16d674ec800000b902a44f498c730000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030978c820fa5f0f29c1a43825261835914a649039abf5821a2c9beff2d637535902bd55cba29df4726524b4ff09f936eee00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020010000000000000000000000808894a7fe12a7275a1ecc34d6c0d601d2a3205c000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060814fe8268b0c72fb536ff92f119275d239c800810e5f6c72b3724affb7f0390f2f8ae0c7e8b11cee37b995aa3b800eed04d723aef528478c3c04c578461316acf1e884140ceeef8de7fe8b9628556b44873d07ea0c3a0f83ead565c1c14aae750000000000000000000000000000000000000000000000000000000000000001c98997f2deaf9cbe47079d43d435f1c0ce210e48886926cb44d09468d5a334d4c0';
      const slatePayload = rawSlateTx.value;
      try {
        const transaction = ethers.utils.parseTransaction(slatePayload);

        const methodId = utils.hexDataSlice(transaction.data, 0, 4);
        if (methodId !== DEPOSIT_METHOD_ID) {
          throw new Error(
            'Deposit transaction should call deposit method for the contract!',
          );
        }

        const decodedData = utils.defaultAbiCoder.decode(
          ['bytes[]', 'bytes[]', 'bytes[]', 'bytes32[]'],
          utils.hexDataSlice(transaction.data, 4),
        );

        decodedData.forEach((dataArr) => {
          decodedData.forEach((otherDataArr) => {
            if (dataArr.length !== otherDataArr.length) {
              throw new Error('Deposit data arrays should be of same length!');
            }
          });
        });

        const deposits = [];
        for (let i = 0; i < decodedData[0].length; i += 1) {
          deposits.push({
            validatorPubKey: decodedData[0][i],
            withdrawalCredentials: decodedData[1][i],
            signature: decodedData[2][i],
            depositDataRoot: decodedData[3][i],
          });
        }

        const final = {
          fundingAccountAddress: transaction.from,
          amount: ethers.utils.formatEther(transaction.value, 'ETH'),
          contractAddress: transaction.to,
          deposits,
        };

        console.log('final', final);
        console.log('tx', transaction);

        const paramsSlate = [
          {
            from: accounts[0], // The user's active address.
            to: transaction.to,
            value: transaction.value._hex,
            data: transaction.data,
          },
        ];

        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: paramsSlate,
        });
        slateSignResult.innerHTML = txHash;
      } catch (err) {
        console.error(err);
        slateSignResult.innerHTML = `Error: ${err.message}`;
      }
    };

    messageToSignInput.onkeyup = () => {
      if (messageSignButton.disabled && messageToSignInput.value.length > 0) {
        messageSignButton.disabled = false;
      } else if (
        !messageSignButton.disabled &&
        messageToSignInput.value.length === 0
      ) {
        messageSignButton.disabled = true;
      }
    };

    messageSignButton.onclick = async () => {
      const messageInput = messageToSignInput.value.trim();

      const messageHex = messageInput.startsWith('0x')
        ? messageInput
        : utils.hexlify(
            utils.toUtf8Bytes(messageInput.replaceAll('\\n', '\n')),
          );
      try {
        const params = [messageHex, accounts[0]];
        const signature = await ethereum.request({
          method: 'personal_sign',
          params,
        });
        messageSignResult.innerHTML = signature;
      } catch (err) {
        console.error(err);
        messageSignResult.innerHTML = `Error: ${err.message}`;
      }
    };

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await ethereum.request({
          method: 'eth_accounts',
        });
        getAccountsResults.innerHTML = _accounts || 'Not able to get accounts';
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };
  };

  function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    accountsDiv.innerHTML = accounts;
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    updateButtons();
  }

  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId;

    if (chainId === '0x1') {
      warningDiv.classList.remove('warning-invisible');
    } else {
      warningDiv.classList.add('warning-invisible');
    }

    // Wait until warning rendered or not to improve accuracy
    if (!scrollToHandled) {
      handleScrollTo({ delay: true });
    }
  }

  function handleNewNetwork(networkId) {
    networkDiv.innerHTML = networkId;
  }

  async function handleScrollTo({ delay = false } = {}) {
    if (!scrollTo) {
      return;
    }

    scrollToHandled = true;

    console.log('Attempting to scroll to element with ID:', scrollTo);

    const scrollToElement = document.getElementById(scrollTo);

    if (!scrollToElement) {
      console.warn('Cannot find element with ID:', scrollTo);
      return;
    }

    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    scrollToElement.scrollIntoView();
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      });
      handleNewChain(chainId);

      const networkId = await ethereum.request({
        method: 'net_version',
      });
      handleNewNetwork(networkId);
    } catch (err) {
      console.error(err);
    }
  }

  updateButtons();

  if (isMetaMaskInstalled()) {
    ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ethereum.on('chainChanged', () => getNetworkAndChainId());
    // networkChanged is deprecated, but there is no other way to ensure we catch every network ID change
    ethereum.on('networkChanged', () => getNetworkAndChainId());
    ethereum.on('accountsChanged', (newAccounts) => {
      handleNewAccounts(newAccounts);
    });

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  } else {
    handleScrollTo();
  }
};

window.addEventListener('load', initialize);

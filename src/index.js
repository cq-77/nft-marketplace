import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import NFTMarketplace from '../src/abis/NFTMarketplace.json';
import Nft from '../src/abis/Nft.json';
import { getNativeByChain, getNameByChain, CHAIN_IDS } from './helpers/networks.js';
import './minter.js';
import '@google/model-viewer';
import { DisplayERC20 } from './getERC20.js';
import { DisplayNFTs } from './getNFTs';
import { loadExplore } from './marketplace.js';

const currentUrl = new URL(window.location.href);
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:8080' : undefined;

const polygonMarketAddress = "0xc35Be26DE5CAa5873579d0aAd82e20D06cDC4D99";
const mumbaiMarketAddress = "0xfe8E14B7A4A38066d02059d1477F33e76d05aa82";
const mumbaiNFTAddress = "0xab38445408DC5AD2Ef90778cD2514D837e59EcbC";
const polygonNFTAddress = "0x3B64C4AC309B168169eD590258dE59aa46cA25ce";

const { isMetaMaskInstalled } = MetaMaskOnboarding;

// Authentication Section
const installMetamaskBtn = document.getElementById('installMetamaskButton');
const connectToEthereum = document.getElementById('connectToEthereum');
const connectToPolygon = document.getElementById('connectToPolygon');
const connectToMumbai = document.getElementById('connectToMumbai');
const getAccountsResults = document.getElementById('getAccountsResult');

// Get Chain Name
const getChainName = document.getElementById('getChainName');
getChainName.innerHTML = null;

const initialize = async () => {

  let onboarding;
  let chainId;
  let accounts;
  let networkId;
  let chainName;
  
  await Moralis.start({
    apiKey: "nezp9hUq4udVQbnQHEokxz411Zx5xdlT5DK4DnBbWBXYQgKSCKhm0G4HBK0OODxF"
  })

  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickInstall = () => {
    installMetamaskBtn.innerText = 'Onboarding in progress';
    installMetamaskBtn.disabled = true;
    onboarding.startOnboarding();
  };

  connectToEthereum.onclick = async () => {
    try 
    {
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
      handleNewAccounts(newAccounts)
    }
    catch (error) 
    {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x1',
                chainName: 'Ethereum Mainnet',
                rpcUrls: ['https://mainnet.infura.io/v3/'],
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.log(addError)
          alert(addError)
        }
      }
      getAccountsResults.innerHTML = `Error: ${error.message}`;
    }
  }

  connectToMumbai.onclick = async() => {
    try 
    {
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      });
      handleNewAccounts(newAccounts)
    }
    catch (error) 
    {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13881',
                chainName: 'Mumbai',
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.log(addError)
        }
      }
      getAccountsResults.innerHTML = `Error: ${error.message}`;
    }
  }

  connectToPolygon.onclick = async () => {
    try 
    {
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
      handleNewAccounts(newAccounts)
    }
    catch (error) 
    {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x89',
                chainName: 'Polygon',
                rpcUrls: ['https://polygon-rpc.com/'],
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.log(addError)
        }
      }
      getAccountsResults.innerHTML = `Error: ${error.message}`;
    }
  }

  async function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    getAccountsResults.innerHTML = accounts;
    
    if(isMetaMaskConnected())
    {
      if (onboarding) {
        onboarding.stopOnboarding();
      }

      if(CHAIN_IDS.includes(chainId)) {
        connectToEthereum.innerText = 'Connected';
        connectToMumbai.innerText = 'Connected';
        connectToPolygon.innerText = 'Connected';
        connectToEthereum.disabled = true;
        connectToMumbai.disabled = true;
        connectToPolygon.disabled = true;
        accounts = newAccounts;
        getAccountsResults.innerHTML = accounts;
        getChainName.innerHTML = chainName;
        await DisplayNFTs();
        await DisplayERC20();
        await loadExplore();
      }
      else {
        getAccountsResults.innerHTML = "Address not detected.";
        getChainName.innerHTML = null;
        nftsContainer.innerHTML = "Please Switch to Ethereum or Polygon Network.";
        erc20Tokens.innerHTML = "Selected Chain Not Supported.";
        connectToEthereum.innerText = 'Connect to Ethereum';
        connectToMumbai.innerText = 'Connect to Mumbai';
        connectToPolygon.innerText = 'Connect to Polygon';
        exploreNFTs.innerHTML = `<p>Smart contract not deployed to this network.</p>`;
        connectToEthereum.disabled = false;
        connectToMumbai.disabled = false;
        connectToPolygon.disabled = false;
      }
    }
    else {
      connectToEthereum.innerText = 'Connect to Ethereum';
      connectToMumbai.innerText = 'Connect to Mumbai';
      connectToPolygon.innerText = 'Connect to Polygon';
      getChainName.innerHTML = null;
      connectToEthereum.disabled = false;
      connectToMumbai.disabled = false;
      connectToPolygon.disabled = false;

      nftsContainer.innerHTML = ``;
      erc20Tokens.innerHTML = ``;
      getETHBalance.innerHTML = "0.0";
      getMATICBalance.innerHTML = "0.0";
      exploreNFTs.innerHTML = `<p>Please connect to Metamask to access this page.</p>`;
    }
  }

  async function handleNewNetwork(newNetwork) {
    networkId = newNetwork
  }

  async function handleNewChain(newChain) {
    if(CHAIN_IDS.includes(newChain)) {
      chainId = newChain
      chainName = getNameByChain(chainId);
      getAccountsResults.innerHTML = accounts;
      getChainName.innerHTML = chainName;
      connectToEthereum.innerText = 'Connected';
      connectToMumbai.innerText = 'Connected';
      connectToPolygon.innerText = 'Connected';
      connectToEthereum.disabled = true;
      connectToMumbai.disabled = true;
      connectToPolygon.disabled = true;
      await DisplayNFTs();
      await DisplayERC20();
      await loadExplore();
    }
    else {
      nftsContainer.innerHTML = "Please Switch to Ethereum or Polygon Network.";
      erc20Tokens.innerHTML = "Selected Chain Not Supported.";
      getAccountsResults.innerHTML = "Address not detected.";
      getChainName.innerHTML = null;
      connectToEthereum.innerText = 'Connect to Ethereum';
      connectToMumbai.innerText = 'Connect to Mumbai';
      connectToPolygon.innerText = 'Connect to Polygon';
      exploreNFTs.innerHTML = `<p>Smart contract not deployed to this network.</p>`;
      connectToEthereum.disabled = false;
      connectToMumbai.disabled = false;
      connectToPolygon.disabled = false;
    }
  }

  async function getNetworkAndChainId() {
    try {
        chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      handleNewChain(chainId)

      const network = await window.ethereum.request({
        method: 'net_version',
      });
      handleNewNetwork(network);
    } catch (err) {
      console.error(err);
    }
  }

  if (!isMetaMaskInstalled()) {
    installMetamaskBtn.innerText = 'Install MetaMask!';
    installMetamaskBtn.onclick = onClickInstall;
    installMetamaskBtn.disabled = false;

    connectToEthereum.disabled = true;
    connectToMumbai.disabled = true;
    connectToPolygon.disabled = true;
  }
  else {
    installMetamaskBtn.innerText = 'Metamask Installed';
    installMetamaskBtn.disabled = true;
    
    connectToEthereum.disabled = false;
    connectToMumbai.disabled = false;
    connectToPolygon.disabled = false;
  }

  if (isMetaMaskInstalled()) {
    window.ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    window.ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    window.ethereum.on('chainChanged', (chain) => {
      handleNewChain(chain);
    });
    window.ethereum.on('chainChanged', handleNewNetwork);
    window.ethereum.on('accountsChanged', (newAccounts) => {
      handleNewAccounts(newAccounts);
    });

    try {
      const newAccounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
};
window.addEventListener('load', initialize);
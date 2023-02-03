import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import { ethers } from 'ethers';

// Get ERC20 Balance Section
const getETHBalance = document.getElementById('getETHBal');
const getMATICBalance = document.getElementById('getMATICBal');
// Set default balance
getETHBalance.innerHTML = "0.0"
getMATICBalance.innerHTML = "0.0"

// Display ERC20 Tokens
const erc20Tokens = document.querySelector('.erc20Tokens');

// Display ERC20 Tokens
export async function DisplayERC20()
{
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    let erc20Content = ``;
    
    if(accounts.toString() === "")
    {
      erc20Tokens.innerHTML = ``;
    }

    const chain = chainId.toString();
    const currentChain = EvmChain.create(chain)

    const balances = await Moralis.EvmApi.balance.getNativeBalance({
      address: accounts[0].toString(), // charles's wallet : 0x4d26b10A97F13Bd970Fd3EC78a54Bc8533cAB970
      chain: chainId
    });
    // console.log(balances.result.balance.ether)

    if(currentChain.currency.name === "MATIC")
      {
        getMATICBalance.innerHTML = balances.result.balance.ether
        getETHBalance.innerHTML = "0.0"
      }
      else if(currentChain.currency.name.includes("Ether"))
      {
        getETHBalance.innerHTML = balances.result.balance.ether
        getMATICBalance.innerHTML = "0.0"
      }
      else {
        getETHBalance.innerHTML = "0.0";
        getMATICBalance.innerHTML = "0.0"
        alert("Wallet balance not detected")
      }
  
      // const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
      //   address: accounts[0].toString(),
      //   chain: chainId
      // })

      let myHeaders = new Headers();
      myHeaders.append("X-API-Key", "nezp9hUq4udVQbnQHEokxz411Zx5xdlT5DK4DnBbWBXYQgKSCKhm0G4HBK0OODxF");

      let raw = "";

      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch("https://deep-index.moralis.io/api/v2/" + String(accounts) + "/erc20?chain=" + String(chainId), requestOptions)
        .then(response => response.json())
        .then(result => {if(result.length == 0) {
          erc20Tokens.innerHTML = `<p>NO TOKENS TO DISPLAY</p>`;
        } else {
          result.forEach(token => {
            erc20Content =
            erc20Content +
      
            `
            <p class="info-text">
            Token Name: <span>${token.name}</span>
            </p>
            <p class="info-text">
              Token Balance: <span>${ethers.utils.formatUnits(token.balance, 18)} ${token.symbol}</span>
            </p>
            <hr/>
            `;
            erc20Tokens.innerHTML = erc20Content;
          })
        }})
        .catch(error => console.log('error', error));
  
      // if(tokenBalances.result.length == 0)
      // {
      //   erc20Tokens.innerHTML = `<p>NO TOKENS TO DISPLAY</p>`;
      // }
  
      // Format the balances to a readable output with the .display() method
      //const tokens = tokenBalances.result.map((token) => token.display())
  
      // tokenBalances.result.forEach(token => {
      //   erc20Content =
      //   erc20Content +
  
      //   `
      //   <p class="info-text">
      //   Token Name: <span>${token.token.name}</span>
      //   </p>
      //   <p class="info-text">
      //     Token Balance: <span>${token.value} ${token.token.symbol}</span>
      //   </p>
      //   <hr/>
      //   `;
      //   erc20Tokens.innerHTML = erc20Content;
      // });
   // console.log(tokenBalances.result[0].token.symbol)
}

window.addEventListener('load', DisplayERC20);

// let myHeaders = new Headers();
// myHeaders.append("X-API-Key", "nezp9hUq4udVQbnQHEokxz411Zx5xdlT5DK4DnBbWBXYQgKSCKhm0G4HBK0OODxF");

// let raw = "";

// let requestOptions = {
//   method: 'GET',
//   headers: myHeaders,
//   redirect: 'follow'
// };

// fetch("https://deep-index.moralis.io/api/v2/" + String(accounts) + "/erc20?chain=" + String(chainId), requestOptions)
//   .then(response => response.json())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));
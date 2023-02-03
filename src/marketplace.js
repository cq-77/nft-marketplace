import Moralis from 'moralis';
import Web3 from 'web3';
import NFTMarketplace from '../src/abis/NFTMarketplace.json';
import { getNativeByChain, getNameByChain, CHAIN_IDS } from './helpers/networks.js';

const web3 = new Web3(window.ethereum);

const explore = document.querySelector('.explore-content');
const exploreNFTs = document.getElementById('explore-nfts');
const isVisible = "is-visible";

const polygonMarketAddress = "0xc35Be26DE5CAa5873579d0aAd82e20D06cDC4D99";
const mumbaiMarketAddress = "0xfe8E14B7A4A38066d02059d1477F33e76d05aa82";
const mumbaiNFTAddress = "0xab38445408DC5AD2Ef90778cD2514D837e59EcbC";
const polygonNFTAddress = "0x3B64C4AC309B168169eD590258dE59aa46cA25ce";

let tokenID;
let metadataURL;
let nativeName;
let accounts;
let chainId;

export async function loadExplore() {

    accounts = await window.ethereum.request({ method: 'eth_accounts' });
    chainId = await window.ethereum.request({ method: 'eth_chainId' });

    nativeName = getNativeByChain(chainId);

    let exploreContent = ``;
    let response;
    let nfts = [];

    const networkId = await window.ethereum.request({ method: 'net_version' });
    const networkData = NFTMarketplace.networks[networkId];
    const abi = NFTMarketplace.abi;
    const address = networkData.address;
    const contract = new web3.eth.Contract(abi, address);

    const marketNFTs = await contract.methods.fetchMarketItems().call();

    if(marketNFTs.length == 0)
    {
      exploreNFTs.innerHTML = `<p>NO NFTS TO BUY</p>`;
    }

    for(let x = 0; x < marketNFTs.length; x++) {
      tokenID = marketNFTs[x].tokenId;

      try{
        response = await Moralis.EvmApi.nft.getNFTMetadata({
          address: marketNFTs[x].nftContract.toString(),
          chain: chainId,
          tokenId: tokenID,
        });
      }
      catch(e) {
        alert(e.message)
      }

      // if(networkId == 80001) {
      //   try{
      //     response = await Moralis.EvmApi.nft.getNFTMetadata({
      //       address: marketNFTs[x].nftContract.toString(),
      //       chain: chainId,
      //       tokenId: tokenID,
      //     });
      //   }
      //   catch(e) {
      //     alert(e.message)
      //   }
      // }
      // else if(networkId == 137) {
      //   try{
      //     response = await Moralis.EvmApi.nft.getNFTMetadata({
      //       address: marketNFTs[x].nftContract.toString(),
      //       chain: chainId,
      //       tokenId: tokenID,
      //     });
      //   }
      //   catch(e) {
      //     alert(e.message)
      //   }
      // }
      // else {
      //     alert("Chain Not Supported.")
      // }

        metadataURL = fixURL(response.result.metadata.image)

        let items = {
          metaName: response.result.metadata.name,
          metaURL: metadataURL,
        }

        if(marketNFTs[x].sold == false) {
          nfts.push(items);
        }
        
        exploreContent =
        exploreContent + 
        `
        <br/><br/>
        <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
              <div class="card full-width">
                <div class="card-body">
                  <div class="all-nfts">
                    <div class="card" id="show-badge" data-label="Buy Now"></div>
                        ${
                          metadataURL.includes('.jpg') || metadataURL.includes('.png') || metadataURL.includes('.gif') || metadataURL.includes('.svg')
                          ? `<img src="${metadataURL}" class="center" width="50%" height="50%" alt="${metadataURL}" />`
                          : metadataURL.includes('.mp4') || metadataURL.includes('.webm')
                          ? `<video width="100%" controls><source src="${metadataURL}"/></video>`
                          : metadataURL.includes('.mp3') || metadataURL.includes( '.wav')  || metadataURL.includes('.ogg')
                          ? `<audio width="100%" controls src="${metadataURL}"></audio>`
                          : metadataURL.includes('.glb') || metadataURL.includes('.gltf')
                          ? `<model-viewer loading="eager" camera-controls auto-rotate src="${metadataURL}"></model-viewer>`
                          : metadataURL.includes('https://dweb.link/ipfs/') || !metadataURL.startsWith('https') || !metadataURL.startsWith('ipfs')
                          ? `<img src="${metadataURL}" class="center" width="50%" height="50%" alt="${metadataURL}" />`
                          :``
                        }
                      <br/>
                        <h3>${nfts[x].metaName}</h3>
                      </div>
                      <hr/>
                      <div class="select-nft-container">
                        <button type="button" class="open-modal2" data-open="modal2">Buy</button>
                      </div>
                  </div>
                </div>
              </div>
        </div>
        `;
  
        exploreNFTs.innerHTML = exploreContent;

        document.querySelectorAll('.open-modal2').forEach((el, i) => {
          let modalImg;
          el.addEventListener('click', () => {
            const modal2 = document.querySelector('.open-modal2').dataset.open;
            document.getElementById(modal2).classList.add(isVisible);
            modalImg = nfts[i].metaURL;
            if(accounts[0] == marketNFTs[i].seller.toLowerCase()) {
              explore.innerHTML =
              `<div class="failList">Owner can't make the purchase.</div>`
            }
            else {
              explore.innerHTML = 
              `
                <div class="modalImg">
                  <div class="card" id="badge" data-label="${marketNFTs[i].price / ("1e" + 18)} ${nativeName}"></div>
                  ${
                    modalImg.includes('.jpg') || modalImg.includes('.png') || modalImg.includes('.gif') || modalImg.includes('.svg')
                    ? `<img src="${modalImg}" class="center" width="50%" height="50%" alt="${modalImg}" />`
                    : modalImg.includes('.mp4') || modalImg.includes('.webm')
                    ? `<video width="100%" controls><source src="${modalImg}"/></video>`
                    : modalImg.includes('.mp3') ||modalImg.includes( '.wav')  || modalImg.includes('.ogg')
                    ? `<audio width="100%" controls src="${modalImg}"></audio>`
                    : modalImg.includes('.glb') || modalImg.includes('.gltf')
                    ? `<model-viewer loading="eager" camera-controls auto-rotate src="${modalImg}"></model-viewer>`
                    : modalImg.includes('https://dweb.link/ipfs/') || !modalImg.startsWith('https') || !modalImg.startsWith('ipfs')
                    ? `<img src="${modalImg}" class="center" width="50%" height="50%" alt="${modalImg}" />`
                    :``
                  }
                </div>
                <br/>
                <button class="btn" id="buyNFT">Buy</button>
              `;
            }
            
            document.getElementById('buyNFT').addEventListener("click", () => {
              purchase(marketNFTs[i].nftContract, marketNFTs[i].itemId, marketNFTs[i].price);
            })

          })

          document.addEventListener("click", e => {
            if (e.target == document.querySelector(".modal.is-visible")) {
              document.querySelector(".modal.is-visible").classList.remove(isVisible);
            }
          });
          
        }); 
      } 
}

function fixURL(url)
{
  if(url.startsWith("ipfs"))
  {
    return url.replace(/^ipfs:\/\//, "https://dweb.link/ipfs/");
  }
  else if(url.startsWith("https") && url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.svg') || url.endsWith('.gif')) {
    return url;
  }
  else if(!url.startsWith("ipfs") || !url.startsWith("https")) {
    return url;
  }
  else {
    let newUrl = url.substring(url.indexOf("ipfs/"));
    return ("https://dweb.link/").concat(newUrl);
  }
}

// Purchase NFT

const purchase = async(nftContract, itemId, price) => {

    const newPrice = web3.utils.fromWei(price.toString(), 'ether')
    
    const networkId = await web3.eth.net.getId();
    const networkData = NFTMarketplace.networks[networkId];

    if(networkData) {
      const abi = NFTMarketplace.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);

      try {
        explore.innerHTML = 
        `
        <div class="loader"></div>
        `
        if(networkId == 80001) {
          const purchaseTx = {
            from: accounts[0],
            to: mumbaiMarketAddress,
            gasPrice: web3.eth.gasPrice,
            gas: String(100000),
            value: parseInt(web3.utils.toWei(String(newPrice), "ether")).toString(16),
            data: contract.methods.createMarketSale(nftContract, itemId).encodeABI()
          }
  
          const purchaseTxHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [purchaseTx],
          });

          setTimeout(async() => {
            explore.innerHTML =
            `
              <div class="main-container">
                <div class="check-container">
                  <div class="check-background">
                    <svg viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 25L27.3077 44L58.5 7" stroke="white" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      </div>
                      <div class="check-shadow"></div>
                  </div>
                <h1>Success</h1> 
                <p>You've bought this NFT!</p>
              </div>
            `
            await loadExplore();
            await DisplayNFTs();
          }, 40 * 1000);
        }
        if(networkId == 137) {
          const purchaseTx = {
            from: accounts[0],
            to: polygonMarketAddress,
            gasPrice: web3.eth.gasPrice,
            gas: String(100000),
            value: parseInt(web3.utils.toWei(String(newPrice), "ether")).toString(16),
            data: contract.methods.createMarketSale(nftContract, itemId).encodeABI()
          }
  
          const purchaseTxHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [purchaseTx],
          });
  
          setTimeout(async() => {
            explore.innerHTML =
            `
              <div class="main-container">
                <div class="check-container">
                  <div class="check-background">
                    <svg viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 25L27.3077 44L58.5 7" stroke="white" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      </div>
                      <div class="check-shadow"></div>
                  </div>
                <h1>Success</h1> 
                <p>You've bought this NFT!</p>
              </div>
            `
            await loadExplore();
            await DisplayNFTs();
          }, 40 * 1000);
        }
       
      }
      catch(error) {
        explore.innerHTML = 
        `
        <div class="failPurchase">Error - ${error.message}</div>
        `
      }
    }
}

window.addEventListener('load', loadExplore);

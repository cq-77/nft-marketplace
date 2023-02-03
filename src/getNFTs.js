import Moralis from 'moralis';
import Web3 from 'web3';
import NFTMarketplace from '../src/abis/NFTMarketplace.json';
import Nft from '../src/abis/Nft.json';

const web3 = new Web3(window.ethereum);

const nftsContainer = document.getElementById('nfts-container');
const isVisible = "is-visible";
const modalContent = document.querySelector('.modal-content');

const polygonMarketAddress = "0xc35Be26DE5CAa5873579d0aAd82e20D06cDC4D99";
const mumbaiMarketAddress = "0xfe8E14B7A4A38066d02059d1477F33e76d05aa82";
const mumbaiNFTAddress = "0xab38445408DC5AD2Ef90778cD2514D837e59EcbC";
const polygonNFTAddress = "0x3B64C4AC309B168169eD590258dE59aa46cA25ce";

let nfts;
let url;
let setPrice;
let accounts;
let chainId;

export async function DisplayNFTs()
{
    accounts = await window.ethereum.request({ method: 'eth_accounts' });
    chainId = await window.ethereum.request({ method: 'eth_chainId' });

    let content = ``;
    let tokenId;
    let tokenAddr;
    let ownerOf;

    if(String(accounts) === "") 
    {
        nftsContainer.innerHTML = content;
    }
    
    nfts = await Moralis.EvmApi.nft.getWalletNFTs({
        address: accounts[0].toString(),
        chain: chainId,
        // limit: 100
    });

    if(nfts.result.length == 0)
    {
        nftsContainer.innerHTML = `<p>NO NFTS TO DISPLAY</p>`;
    }

    for(let i = 0; i < nfts.result.length; i++) {
        tokenId = nfts.result[i].result.tokenId;
        tokenAddr = nfts.result[i].tokenAddress._value;
        ownerOf = nfts.result[i].ownerOf._value;

        const networkId = await window.ethereum.request({ method: 'net_version' });
        const networkData = NFTMarketplace.networks[networkId];
        const abi = NFTMarketplace.abi;
        const address = networkData.address;
        const contract = new web3.eth.Contract(abi, address);

        const marketNFTs = await contract.methods.fetchMarketItems().call();

        let result = marketNFTs.findIndex((e) => e.tokenId == tokenId)
        let tokenAddrResult = marketNFTs.findIndex((e) => e.nftContract == tokenAddr)
        let ownerResult = marketNFTs.findIndex((e) => e.seller == ownerOf)

        // if(result != -1 && tokenAddrResult != -1 && ownerResult != -1 && marketNFTs[i] != undefined) {
        //   console.log(tokenId)
        //   console.log(ownerOf)
        //   console.log(tokenAddr)
        //   console.log(nfts.result[i].metadata.name)
        //   console.log(marketNFTs[i])
        // }

        if(nfts.result[i].metadata == undefined || nfts.result[i].metadata.image == undefined) return;

        url = fixURL(nfts.result[i].metadata.image)
    
        content = 
        content +

        `
        <br/><br/>
        <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <div class="card full-width">
                <div class="card-body">
                <div class="all-nfts">
                        <div class="nfts-holder">
                        ${
                        url.includes('.jpg') || url.includes('.png') || url.includes('.gif') || url.includes('.svg')
                        ? `<img src="${url}" class="center" width="50%" height="50%" alt="${url}" />`
                        : url.includes('.mp4') || url.includes('.webm')
                        ? `<video width="100%" controls><source src="${url}"/></video>`
                        : url.includes('.mp3') ||url.includes( '.wav')  || url.includes('.ogg')
                        ? `<audio controls src="${url}"></audio>`
                        : url.includes('.glb') || url.includes('.gltf')
                        ? `<model-viewer loading="eager" camera-controls auto-rotate src="${url}"></model-viewer>`
                        : url.includes('https://dweb.link/ipfs/') || !url.startsWith('https') || !url.startsWith('ipfs')
                        ? `<img src="${url}" class="center" width="50%" height="50%" alt="${url}" />`
                        : ``
                        }
                    </div>
                    <div>
                    <br/>
                        <h3>${nfts.result[i].metadata.name}</h3>
                    </div>
                    <hr/>
                    <div class="select-nft-container">
                    ${
                        result != -1 && tokenAddrResult != -1 && ownerResult != -1 && marketNFTs != undefined
                        ? `<button type="button" class="open-modal" data-open="modal1" disabled>Listed</button>`
                        : `<button type="button" id="openSell" class="open-modal" data-open="modal1">Sell</button>`
                    }
                    </div>
                </div>
                </div>
            </div>
        </div>    
        `;
        nftsContainer.innerHTML = content;

        document.querySelectorAll('.open-modal').forEach((el, i) => {
        let modalImg;
        if(nfts.result[i].metadata == undefined || nfts.result[i].metadata.image == undefined) return;

        modalImg = fixURL(nfts.result[i].metadata.image);

        el.addEventListener('click', () => {
            const modalId = document.querySelector('.open-modal').dataset.open;
            document.getElementById(modalId).classList.add(isVisible);

            modalContent.innerHTML = 
            `
            <div class="modalImg">
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
            <input type="number" id="price" min="0" placeholder="Set Price"/>
            <button class="btn" id="listNFT">Sell</button>
            `;

            const priceInputHandler = (e) => {
            setPrice = e.target.value;         
            }
            document.getElementById('price').addEventListener('input', priceInputHandler)
            document.getElementById('price').addEventListener('propertychange', priceInputHandler)

            document.getElementById('listNFT').addEventListener("click", () => {
            if(setPrice != null) {
                list(nfts.result[i].result.tokenId, setPrice, nfts.result[i].tokenAddress._value);
            }
            else {
                alert("Price cannot be empty!")
            } 
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

// Create Listing

const list = async(tokenId, listPrice, nftContract) => {
    const price = listPrice * ("1e" + 18);

    const networkId = await web3.eth.net.getId();
    const networkData = NFTMarketplace.networks[networkId];

    if(networkData) {
        const abi = NFTMarketplace.abi;
        const address = networkData.address;
        const contract = new web3.eth.Contract(abi, address);

        const nftABI = Nft.abi;
        const nftNetworkaddress = networkData.address;
        const NFTContract = new web3.eth.Contract(nftABI, nftNetworkaddress);
        
        try{
            modalContent.innerHTML = 
            `
            <div class="loader"></div>
            `
            if(networkId == 80001) {
              const allowListing = {
                from: accounts[0],
                to: nftContract,
                gasPrice: web3.eth.gasPrice,
                gas: String(100000),
                data: NFTContract.methods.setApprovalForAll(mumbaiMarketAddress, true).encodeABI()
              }
              const allowListingTx = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [allowListing],
              });
              
              const tx = {
                  from: accounts[0],
                  to: mumbaiMarketAddress,
                  gasPrice: web3.eth.gasPrice,
                  gas: String(100000),
                  data: contract.methods.createMarketItem(nftContract, tokenId, String(price)).encodeABI()
              }
              
              const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [tx],
              });

              setTimeout(async() => {
                modalContent.innerHTML =
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
                  <p>Your NFT has been listed!</p>
                </div>
                `
                await loadExplore();
                await DisplayNFTs();
              }, 40 * 1000);
            }
            else if(networkId == 137) {
              const allowListing = {
                from: accounts[0],
                to: nftContract,
                gasPrice: web3.eth.gasPrice,
                gas: String(100000),
                data: NFTContract.methods.setApprovalForAll(polygonMarketAddress, true).encodeABI()
              }
              const allowListingTx = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [allowListing],
              });
              
              const tx = {
                  from: accounts[0],
                  to: polygonMarketAddress,
                  gasPrice: web3.eth.gasPrice,
                  gas: String(100000),
                  data: contract.methods.createMarketItem(nftContract, tokenId, String(price)).encodeABI()
              }
              
              const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [tx],
              });

              setTimeout(async() => {
                modalContent.innerHTML =
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
                  <p>Your NFT has been listed!</p>
                </div>
                `
                await loadExplore();
                await DisplayNFTs();
              }, 40 * 1000);
            }
           
        }
        catch(err) {
            modalContent.innerHTML = 
            `
            <div class="failList">Error - ${err.message}</div>
            `
        }
    }
}

window.addEventListener('load', DisplayNFTs);
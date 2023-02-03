import Web3 from 'web3';
import { CHAIN_IDS } from './helpers/networks';
import { ethers } from 'ethers';
import { NFTStorage } from 'nft.storage';
import Nft from '../src/abis/Nft.json';
import { MUMBAI_PARAMS, POLYGON_PARAMS } from './helpers/rpc.js';
import '@google/model-viewer';

const uploadContainer = document.querySelector('.upload-container');
const chainOptions = document.querySelector('.chain-options');
const status = document.querySelector('.status');
const hash = document.querySelector('.hash');
const hashContainer = document.querySelector('.hash-container');

const chains = document.getElementById('chains');
const NFT_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQxZmYyZWFhNzI5Yzk0MTBENTdEMTVCY0IwYTJFMDFkRTI1YjA1MzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MTk5NTkyMzI5MCwibmFtZSI6IlRyYWRlTWludC1ORlQifQ.wge-Vmc2a4xZS1VUrWj2XMbcqrG3-wFFcZIDN7w7lzE";

export const minter = async() => {
    let fileItem = null;
    let filePreview = null;
    let fileType;
    let fileName;
    let nftName;
    let nftDesc = "";
    let selectedValue;
    let txHash;

    const web3 = new Web3(window.ethereum)

    // Preview Files

    const handleOndragOver = e => {
        e.preventDefault();
    }
  
    const handleOndrop = e => {
        //prevent the browser from opening the image
        e.preventDefault(); 
        e.stopPropagation(); 
        //let's grab the image file
        let imageFile = e.dataTransfer.files[0];
        previewFile(imageFile);
    }

    const previewFile = (file, fileList) => {
        //console.log(file, fileList)
        fileItem = file;
        fileType = file.type;
        fileName = file.name;

        if(fileType.includes("image")) {
            document.querySelector('.output').innerHTML = `<img id="outputImage" class="mintImage"/>`;
            var outputImage = document.getElementById('outputImage');
            outputImage.src = URL.createObjectURL(file);
            filePreview = outputImage.src;
            outputImage.onload = function() {
                URL.revokeObjectURL(filePreview)
            }
        }
        else if(fileType.includes("video")) {
            document.querySelector('.output').innerHTML = `<video width="100%" controls><source id="outputVideo"/></video>`;
            var outputVid = document.getElementById('outputVideo');
            outputVid.src = URL.createObjectURL(file);
            filePreview = outputVid.src;
            outputVid.onload = function() {
                URL.revokeObjectURL(filePreview)
            }

        }
        else if(fileType.includes("audio")) {
            document.querySelector('.output').innerHTML = `<audio controls class="previewAudio" id="outputAudio"></audio>`;
            var outputAud = document.getElementById('outputAudio');
            outputAud.src = URL.createObjectURL(file);
            filePreview = outputAud.src;
            outputAud.onload = function() {
                URL.revokeObjectURL(filePreview)
            }
        }
        else if(fileName.includes('.glb')) {
            document.querySelector('.output').innerHTML = `<model-viewer loading="eager" id="outputModel" camera-controls auto-rotate></model-viewer>`;
            var outputMod = document.getElementById('outputModel');
            filePreview = URL.createObjectURL(file);
            outputMod.setAttribute('src', filePreview);
            outputMod.onload = function() {
                URL.revokeObjectURL(filePreview)
            }     
        }
        else if(fileName.includes('.gltf')) {
            document.querySelector('.output').innerHTML = `<model-viewer loading="eager" id="outputModel" camera-controls auto-rotate></model-viewer>`;
            var outputMod = document.getElementById('outputModel');
            // outputMod.src = URL.createObjectURL(file);
            // filePreview = outputMod.src
            filePreview = URL.createObjectURL(file);
            outputMod.setAttribute('src', filePreview);
            outputMod.onload = function() {
                URL.revokeObjectURL(filePreview)
            }
            
        }
        else {
            document.querySelector('.output').innerHTML = `<div><img src="./img/uploaderror.png" class="uploadError" /><p class="errorMessage">File format not supported.</p></div>`
        }

        return false;
    }

    function enableOrDisable() {
        const mintEnabled =  document.getElementById('nft-name').value != "" && fileItem != null && document.getElementById('chains').options[selectElement.selectedIndex].value !== "";
        document.querySelector('.mint-button').disabled = !mintEnabled;
    }
    
    uploadContainer.innerHTML =
    `
    <label class="custom-file-upload">
        <input type="file" id="fileUpload" accept=".jpg,.png,.gif,.svg,.mp4,.webm,.mp3,.wav,.ogg,.glb,.gltf">
        <div class="output"><i class="fa fa-upload" style="font-size:24px;color:gray"></i></div>
    </label>
    `
    document.querySelector('.custom-file-upload').ondragover = e => {
        handleOndragOver(e);
    }

    document.querySelector('.custom-file-upload').ondrop = e => {
        handleOndrop(e);
    }

    document.getElementById('fileUpload').ondragover = e => {
        handleOndragOver(e);
    }

    document.getElementById('fileUpload').ondrop = e => {
        handleOndrop(e);
    }

    document.getElementById('fileUpload').onchange = e => {
        previewFile(e.target.files[0])
        enableOrDisable();
    }

    // Select Blockchain

    chainOptions.innerHTML =
    `
    <select id="chains">
        <option value="" selected>- Select Blockchain -</option>
        <option value="80001">Mumbai Testnet</option>
    </select>
    `

    var selectElement = document.getElementById('chains');

    selectElement.addEventListener('change', () => {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        // Get the value of the selected option
        selectedValue = selectedOption.value;
        enableOrDisable();
    })

    // Input NFT Names

    const nftNameInput = e => {
        nftName = e.target.value;
        enableOrDisable();
    }
    
    document.getElementById('nft-name').addEventListener('input', nftNameInput);
    document.getElementById('nft-name').addEventListener('change', nftNameInput);

    // Description

    const nftDescInput = e => {
        nftDesc = e.target.value;
    }

    document.getElementById('nft-desc').addEventListener('input', nftDescInput);
    document.getElementById('nft-desc').addEventListener('change', nftDescInput);

    const copy = async () => {
        await navigator.clipboard.writeText(txHash);
    }

    const mintNFT = async({image, name, description}) => {
        const client = new NFTStorage({ token: NFT_STORAGE_KEY });
        status.innerHTML = `<p class="statusText">Uploading to nft.storage...</p>`

        const metadata = await client.store({
            image,
            name,
            description
        });

        status.innerHTML = `<p class="statusText">Upload complete! Minting token with metadata URI: ${metadata.url}</p>`

        // the returned metadata.url has the IPFS URI we want to add.
        // our smart contract already prefixes URIs with "ipfs://", so we remove it before calling the `mintToken` function
        const metadataURI = metadata.url.replace(/^ipfs:\/\//, "");
        const accounts = await web3.eth.getAccounts()
  
        const networkId = await web3.eth.net.getId()
        console.log(networkId)
  
        const networkData = Nft.networks[networkId]
        console.log(networkData)

        if(networkData) {
            const abi = Nft.abi;
            const contractAddress = networkData.address;
            const contract = new web3.eth.Contract(abi, contractAddress);

            try {
                const tx = {
                    from: accounts[0],
                    to: contractAddress,
                    gasPrice: web3.eth.gasPrice,
                    data: contract.methods.mintToken(accounts[0], metadataURI).encodeABI()
                };

                status.innerHTML = `<p class="statusText">Blockchain transaction sent, waiting confirmation...</p>`

                txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [tx],
                });

                status.innerHTML = `<div class="loader-holder"><span class="minter-loader"></span>Waiting for the block confirmation...</div>`

                setTimeout(() => {
                   status.innerHTML = `<p class="statusText">View your transaction on block explorer.</p>`
                
                   hash.innerHTML =
                   `
                   <div class="hash-container"> 
                       <div class="txText">Copy Transaction Hash: </div>
                       <button class="hash-holder">${txHash.substring(0,6) + "..." + txHash.slice(txHash.length - 4)}</button>
                   </div>
                   `
                   document.querySelector('.hash-holder').onclick = copy;
                }, 20 * 1000);

            }
            catch(error) {
                status.innerHTML = `<p class="statusText">${error.message}</p>`
            }
        }

    }

    const startMinting = async() => {
        await window.ethereum.request({
            method: 'eth_requestAccounts',
        });

        const networkId = await web3.eth.net.getId();

        console.log(selectedValue)
        console.log(networkId)

        if(selectedValue !== String(networkId)) {
            if(selectedValue == "80001") {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [MUMBAI_PARAMS],
                });
            }
            // else if(selectedValue == "4") {
            //     await ethereum.request({
            //         method: 'wallet_addEthereumChain',
            //         params: [POLYGON_PARAMS],
            //     });
            // }
            else {
                alert("Smart contract not deployed. Select different network.")
                return;
            }
        }
        
        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const signer = provider.getSigner();

        signer.getAddress().then(() => {
            mintNFT({
                image: fileItem,
                name: nftName,
                description: nftDesc
            }).then(newTokenId => {
                console.log('minting complete' + newTokenId);
            })
        });
    }

    document.querySelector('.mint-button').onclick = startMinting;

}
window.addEventListener('load', minter);
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Nft is ERC721URIStorage, Ownable {

    using Address for address;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

     constructor() ERC721("NFT", "nft") {}

     function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://";
    }

    function mintToken(address owner, string memory metadataURI)
    public payable
    returns (uint256)
    {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
         _safeMint(owner, id);     
        _setTokenURI(id, metadataURI);

        return id;
    }

}
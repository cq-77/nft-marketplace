// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import './IERC2981Royalties.sol';
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Nft is ERC721URIStorage, Ownable, IERC2981Royalties {

    using Address for address;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

     constructor() ERC721("NFT", "nft") {}

     function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://";
    }

    function _mint(
        address owner,
        uint256 tokenId,
        address royaltyRecipient,
        uint256 royaltyValue
    ) internal {
        _safeMint(owner, tokenId);
        if (royaltyValue > 0) {
            _setTokenRoyalty(tokenId, royaltyRecipient, royaltyValue);
        }
    }

    function mintToken(address owner, string memory metadataURI, address royaltyRecipient, uint256 royaltyValue)
    public payable
    returns (uint256)
    {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
         _mint(owner, id, royaltyRecipient, royaltyValue);     
        _setTokenURI(id, metadataURI);
         //_safeMint(owner, id, royaltyRecipient, '');
        //setApprovalForAll(contractAddress, true);

         if (royaltyValue > 0) {
            _setTokenRoyalty(id, royaltyRecipient, royaltyValue);
        }

        return id;
    }

     mapping(uint256 => RoyaltyInfo) internal _royalties;

     struct RoyaltyInfo {
        address recipient;
        uint256 amount;
    }

    /// @inheritdoc	ERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Royalties).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @dev Sets token royalties
    /// @param id the token id fir which we register the royalties
    /// @param recipient recipient of the royalties
    /// @param value percentage (using 2 decimals - 10000 = 100, 0 = 0)
    function _setTokenRoyalty(
        uint256 id,
        address recipient,
        uint256 value
    ) internal {
        require(value <= 10000, 'ERC2981Royalties: Too high');
        _royalties[id] = RoyaltyInfo(recipient, value);
    }

    function royaltyInfo(uint256 id, uint256 value)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalties = _royalties[id];
        return (royalties.recipient, ((value * royalties.amount) * 100) / 10000);
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "ERC1155: address zero is not a valid owner");
        return _balances[id][account];
    }

    function getAllTokens(address account) public view returns (uint256[] memory)
    {
        uint256 numTokens = 0;
        for (uint i = 0; i <=_tokenIds.current(); i++)
        {
            if (balanceOf(account, i) > 0)
            {
                numTokens++;
            }
        }

        uint256[] memory ret = new uint256[](numTokens);
        uint256 counter = 0;
        for (uint i = 0; i <=_tokenIds.current(); i++)
        {
            if (balanceOf(account, i) > 0)
            {
                ret[counter] = i;
                counter++;
            }
        }
        return ret;
    }

}



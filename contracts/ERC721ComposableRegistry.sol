pragma solidity ^0.4.23;

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
    function transferFrom(address from, address to, uint tokenId) public;
}

contract ERC721ComposableRegistry {

    mapping (address => mapping (uint => TokenIdentifier)) parents;

    struct TokenIdentifier {
        address erc721;
        uint tokenId;
    }

    function onERC721Received(address from, uint whichTokenId, bytes data) public returns (bytes4) {
        ERC721 whichErc721 = ERC721(msg.sender);
        parents[whichErc721][whichTokenId] = TokenIdentifier(whichErc721, 1);
        return 0xf0b9e5ba;
    }

    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, to, whichTokenId);
        delete parents[whichErc721][whichTokenId];
    }

    function transfer(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        require(ownerOf(toErc721, toTokenId) != 0);
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        if (ownerOfWhichByErc721 != address(this)) {
            whichErc721.transferFrom(ownerOfWhichByErc721, address(this), whichTokenId);
        }
        parents[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        TokenIdentifier memory parent = parents[erc721][tokenId];
        while (parent.erc721 != 0) {
            erc721 = ERC721(parent.erc721);
            tokenId = parent.tokenId;
            parent = parents[erc721][tokenId];
        }
        return erc721.ownerOf(tokenId);
    }
}

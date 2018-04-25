pragma solidity ^0.4.23;

contract ERC20 {

    function transfer(address to, uint amount) public returns (bool);

    function transferFrom(address owner, address to, uint amount) public returns (bool);
}

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
}

contract ERC721ComposableRegistry {

    mapping (address => mapping (uint => TokenIdentifier)) parents;

    struct TokenIdentifier {
        address erc721;
        uint tokenId;
    }

    function transfer(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        parents[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        TokenIdentifier memory parent = parents[erc721][tokenId];
        if (parent.erc721 != 0) {
            erc721 = ERC721(parent.erc721);
            tokenId = parent.tokenId;
        }
        return erc721.ownerOf(tokenId);
    }
}

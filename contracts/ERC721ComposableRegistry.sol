pragma solidity ^0.4.23;

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
    function transferFrom(address from, address to, uint tokenId) public;
}

contract ERC721ComposableRegistry {

    mapping (address => mapping (uint => TokenIdentifier)) parents;
    mapping (address => mapping (uint => TokenIdentifier[])) parentToChildren;
    mapping (address => mapping (uint => uint)) childIndexInParentToChildren;

    struct TokenIdentifier {
        ERC721 erc721;
        uint tokenId;
    }

    function onERC721Received(address from, uint whichTokenId, bytes to) public returns (bytes4) {
        require(to.length == 64);
        ERC721 whichErc721 = ERC721(msg.sender);
        require(ownerOf(whichErc721, whichTokenId) == address(this));
        ERC721 toErc721 = ERC721(address(bytesToUint(to, 0)));
        uint toTokenId = bytesToUint(to, 32);
        require(ownerOf(toErc721, toTokenId) != 0);
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        parents[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
        parentToChildren[toErc721][toTokenId].push(TokenIdentifier(whichErc721, whichTokenId));
        return 0xf0b9e5ba;
    }

    function bytesToUint(bytes b, uint index) private pure returns (uint) {
        uint ret;
        for (uint i = index; i < index + 32; i++) {
            ret *= 256;
            ret += uint(b[i]);
        }
        return ret;
    }

    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, to, whichTokenId);
        TokenIdentifier memory parent = parents[whichErc721][whichTokenId];
        delete parents[whichErc721][whichTokenId];
        if (parent.erc721 != ERC721(0)) {
            TokenIdentifier[] storage c = parentToChildren[parent.erc721][parent.tokenId];
            uint index = childIndexInParentToChildren[whichErc721][whichTokenId];
            uint last = c.length - 1;
            if (index < last) {
                c[index] = c[last];
            }
            c.length--;
        }
    }

    function transfer(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        require(ownerOf(toErc721, toTokenId) != 0);
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, address(this), whichTokenId);
        TokenIdentifier memory parent = parents[whichErc721][whichTokenId];
        parents[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
        if (parent.erc721 != ERC721(0)) {
            TokenIdentifier[] storage c = parentToChildren[parent.erc721][parent.tokenId];
            uint index = childIndexInParentToChildren[whichErc721][whichTokenId];
            uint last = c.length - 1;
            if (index < last) {
                c[index] = c[last];
            }
            c.length--;
        }
        parentToChildren[toErc721][toTokenId].push(TokenIdentifier(whichErc721, whichTokenId));
        childIndexInParentToChildren[whichErc721][whichTokenId] = parentToChildren[toErc721][toTokenId].length - 1;
    }

    function requireNoCircularDependency(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private view {
        do {
            require(toErc721 != whichErc721 || toTokenId != whichTokenId);
            TokenIdentifier memory parent = parents[toErc721][toTokenId];
            toErc721 = parent.erc721;
            toTokenId = parent.tokenId;
        } while (toErc721 != ERC721(0));
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        TokenIdentifier memory parent = parents[erc721][tokenId];
        while (parent.erc721 != ERC721(0)) {
            erc721 = parent.erc721;
            tokenId = parent.tokenId;
            parent = parents[erc721][tokenId];
        }
        return erc721.ownerOf(tokenId);
    }

    function children(ERC721 erc721, uint tokenId) public view returns (ERC721[], uint[]) {
        TokenIdentifier[] memory c = parentToChildren[erc721][tokenId];
        ERC721[] memory erc721s = new ERC721[](c.length);
        uint[] memory tokenIds = new uint[](c.length);
        for (uint i = 0; i < c.length; i++) {
            erc721s[i] = c[i].erc721;
            tokenIds[i] = c[i].tokenId;
        }
        return (erc721s, tokenIds);
    }
}

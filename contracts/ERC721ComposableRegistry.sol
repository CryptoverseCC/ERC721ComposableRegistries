pragma solidity ^0.4.23;

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
    function transferFrom(address from, address to, uint tokenId) public;
}

contract ERC721ComposableRegistry {

    mapping (address => mapping (uint => TokenIdentifier)) childToParent;
    mapping (address => mapping (uint => TokenIdentifier[])) parentToChildren;
    mapping (address => mapping (uint => uint)) childToIndexInParentToChildren;

    struct TokenIdentifier {
        ERC721 erc721;
        uint tokenId;
    }

    function onERC721Received(address /* from */, uint whichTokenId, bytes to) public returns (bytes4) {
        require(to.length == 64);
        ERC721 whichErc721 = ERC721(msg.sender);
        require(ownerOf(whichErc721, whichTokenId) == address(this));
        ERC721 toErc721 = ERC721(address(bytesToUint(to, 0)));
        uint toTokenId = bytesToUint(to, 32);
        require(exists(toErc721, toTokenId));
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        add(toErc721, toTokenId, whichErc721, whichTokenId);
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

    function transfer(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        require(exists(toErc721, toTokenId));
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        transferImpl(this, whichErc721, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        add(toErc721, toTokenId, whichErc721, whichTokenId);
    }

    function multiTransfer(ERC721 toErc721, uint toTokenId, ERC721[] whichErc721s, uint[] whichTokenIds) public {
        require(exists(toErc721, toTokenId));
        for (uint i = 0; i < whichErc721s.length; i++) {
            transferImpl(this, whichErc721s[i], whichTokenIds[i]);
            removeFromParentToChildren(whichErc721s[i], whichTokenIds[i]);
            add(toErc721, toTokenId, whichErc721s[i], whichTokenIds[i]);
        }
    }

    function exists(ERC721 erc721, uint tokenId) private view returns (bool) {
        return erc721.ownerOf(tokenId) != 0;
    }

    function requireNoCircularDependency(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private view {
        do {
            require(toErc721 != whichErc721 || toTokenId != whichTokenId);
            TokenIdentifier memory parent = childToParent[toErc721][toTokenId];
            toErc721 = parent.erc721;
            toTokenId = parent.tokenId;
        } while (toErc721 != ERC721(0));
    }

    function add(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private {
        childToParent[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
        uint length = parentToChildren[toErc721][toTokenId].push(TokenIdentifier(whichErc721, whichTokenId));
        childToIndexInParentToChildren[whichErc721][whichTokenId] = length - 1;
    }

    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        transferImpl(to, whichErc721, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        delete childToParent[whichErc721][whichTokenId];
        delete childToIndexInParentToChildren[whichErc721][whichTokenId];
    }

    function transferImpl(address to, ERC721 whichErc721, uint whichTokenId) private {
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        address(whichErc721).call(/* approve(address,uint256) */ 0x095ea7b3, this, whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, to, whichTokenId);
    }

    function removeFromParentToChildren(ERC721 whichErc721, uint whichTokenId) private {
        TokenIdentifier memory parent = childToParent[whichErc721][whichTokenId];
        if (parent.erc721 != ERC721(0)) {
            TokenIdentifier[] storage c = parentToChildren[parent.erc721][parent.tokenId];
            uint index = childToIndexInParentToChildren[whichErc721][whichTokenId];
            uint last = c.length - 1;
            if (index < last) {
                c[index] = c[last];
            }
            c.length--;
        }
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        TokenIdentifier memory parent = childToParent[erc721][tokenId];
        while (parent.erc721 != ERC721(0)) {
            erc721 = parent.erc721;
            tokenId = parent.tokenId;
            parent = childToParent[erc721][tokenId];
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

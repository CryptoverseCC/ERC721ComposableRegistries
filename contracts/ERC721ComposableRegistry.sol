pragma solidity ^0.4.23;

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
    function transferFrom(address from, address to, uint tokenId) public;
}

contract ERC721ComposableRegistry {

    mapping (address => mapping (uint => ERC721)) childToParentErc721;
    mapping (address => mapping (uint => uint)) childToParentTokenId;
    mapping (address => mapping (uint => ERC721[])) parentToChildErc721s;
    mapping (address => mapping (uint => uint[])) parentToChildTokenIds;
    mapping (address => mapping (uint => uint)) childToIndexInParentToChildren;

    function onERC721Received(address from, uint whichTokenId, bytes to) public returns (bytes4) {
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
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        whichErc721.call(/* approve(address,uint256) */ 0x095ea7b3, this, whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, this, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        add(toErc721, toTokenId, whichErc721, whichTokenId);
    }

    function exists(ERC721 erc721, uint tokenId) private view returns (bool) {
        return erc721.ownerOf(tokenId) != 0;
    }

    function requireNoCircularDependency(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private view {
        do {
            require(toErc721 != whichErc721 || toTokenId != whichTokenId);
            ERC721 parentErc721 = childToParentErc721[toErc721][toTokenId];
            toTokenId = childToParentTokenId[toErc721][toTokenId];
            toErc721 = parentErc721;
        } while (toErc721 != ERC721(0));
    }

    function add(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private {
        childToParentErc721[whichErc721][whichTokenId] = toErc721;
        childToParentTokenId[whichErc721][whichTokenId] = toTokenId;
        parentToChildErc721s[toErc721][toTokenId].push(whichErc721);
        uint length = parentToChildTokenIds[toErc721][toTokenId].push(whichTokenId);
        childToIndexInParentToChildren[whichErc721][whichTokenId] = length - 1;
    }

    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        require(ownerOf(whichErc721, whichTokenId) == msg.sender);
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        whichErc721.call(/* approve(address,uint256) */ 0x095ea7b3, this, whichTokenId);
        whichErc721.transferFrom(ownerOfWhichByErc721, to, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        delete childToParentErc721[whichErc721][whichTokenId];
        delete childToParentTokenId[whichErc721][whichTokenId];
        delete childToIndexInParentToChildren[whichErc721][whichTokenId];
    }

    function removeFromParentToChildren(ERC721 whichErc721, uint whichTokenId) private {
        ERC721 parentErc721 = childToParentErc721[whichErc721][whichTokenId];
        if (parentErc721 != ERC721(0)) {
            uint parentTokenId = childToParentTokenId[whichErc721][whichTokenId];
            uint index = childToIndexInParentToChildren[whichErc721][whichTokenId];
            ERC721[] storage erc721s = parentToChildErc721s[parentErc721][parentTokenId];
            uint[] storage tokenIds = parentToChildTokenIds[parentErc721][parentTokenId];
            uint last = tokenIds.length - 1;
            if (index < last) {
                erc721s[index] = erc721s[last];
                tokenIds[index] = tokenIds[last];
            }
            erc721s.length--;
            tokenIds.length--;
        }
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        ERC721 parentErc721 = childToParentErc721[erc721][tokenId];
        while (parentErc721 != ERC721(0)) {
            tokenId = childToParentTokenId[erc721][tokenId];
            erc721 = parentErc721;
            parentErc721 = childToParentErc721[erc721][tokenId];
        }
        return erc721.ownerOf(tokenId);
    }

    function children(ERC721 erc721, uint tokenId) public view returns (ERC721[], uint[]) {
        return (parentToChildErc721s[erc721][tokenId], parentToChildTokenIds[erc721][tokenId]);
    }
}

pragma solidity ^0.4.23;

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
    function transferFrom(address from, address to, uint tokenId) public;
    function safeTransferFrom(address from, address to, uint tokenId, bytes data) public;
    function getApproved(uint tokenId) public view returns (address);
    function isApprovedForAll(address owner, address operator) public view returns (bool);
}

contract ERC721Receiver {

    function onERC721Received(address from, uint tokenId, bytes data) public returns (bytes4);
}

contract ERC721ComposableRegistryInterface {

    event ERC721Transfer(address from, address toErc721, uint toTokenId, address whichErc721, uint whichTokenId);
    event ERC721Transfer(address fromErc721, uint fromTokenId, address toErc721, uint toTokenId, address whichErc721, uint whichTokenId);
    event ERC721Transfer(address fromErc721, uint fromTokenId, address to, address whichErc721, uint whichTokenId);

    function transfer(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) public;
    function multiTransfer(ERC721 toErc721, uint toTokenId, ERC721[] whichErc721s, uint[] whichTokenIds) public;
    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public;
    function multiTransferToAddress(address to, ERC721[] whichErc721s, uint[] whichTokenIds) public;
    function safeTransferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public;
    function safeTransferToAddress(address to, ERC721 whichErc721, uint whichTokenId, bytes data) public;

    function approve(address spender, ERC721 erc721, uint tokenId) public;
    function approveType(address spender, ERC721 erc721, bool value) public;
    function approveAll(address spender, bool value) public;

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address);
    function parent(ERC721 erc721, uint tokenId) public view returns (ERC721, uint);
    function children(ERC721 erc721, uint tokenId) public view returns (ERC721[], uint[]);
    function isApproved(address owner, address spender, ERC721 erc721, uint tokenId) public view returns (bool);
}

contract ERC721ComposableRegistryCallbacks {

    function onComposableRegistryTransfer(address from, address toErc721, uint toTokenId, uint whichTokenId) public;
    function onComposableRegistryTransfer(address fromErc721, uint fromTokenId, address toErc721, uint toTokenId, uint whichTokenId) public;
    function onComposableRegistryTransfer(address fromErc721, uint fromTokenId, address to, uint whichTokenId) public;
}

contract ERC721ComposableRegistry is ERC721Receiver, ERC721ComposableRegistryInterface {

    mapping (address => mapping (uint => TokenIdentifier)) private childToParent;
    mapping (address => mapping (uint => TokenIdentifier[])) private parentToChildren;
    mapping (address => mapping (uint => uint)) private childToIndexInParentToChildren;
    mapping (address => mapping (address => mapping (uint => address))) private approved;
    mapping (address => mapping (address => mapping (address => bool))) private approvedType;
    mapping (address => mapping (address => bool)) private approvedAll;

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
        require(exists(toErc721, toTokenId));
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        addChild(toErc721, toTokenId, whichErc721, whichTokenId);
        emit ERC721Transfer(from, toErc721, toTokenId, whichErc721, whichTokenId);
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
        require(exists(toErc721, toTokenId));
        transferToExistingToken(toErc721, toTokenId, whichErc721, whichTokenId);
    }

    function multiTransfer(ERC721 toErc721, uint toTokenId, ERC721[] whichErc721s, uint[] whichTokenIds) public {
        require(exists(toErc721, toTokenId));
        for (uint i = 0; i < whichErc721s.length; i++) {
            transferToExistingToken(toErc721, toTokenId, whichErc721s[i], whichTokenIds[i]);
        }
    }

    function exists(ERC721 erc721, uint tokenId) private view returns (bool) {
        return erc721.ownerOf(tokenId) != 0;
    }

    function transferToExistingToken(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private {
        address owner = ownerOf(whichErc721, whichTokenId);
        require(owner == msg.sender || isApproved(owner, msg.sender, whichErc721, whichTokenId));
        requireNoCircularDependency(toErc721, toTokenId, whichErc721, whichTokenId);
        TokenIdentifier memory p = childToParent[whichErc721][whichTokenId];
        bool hasParent = p.erc721 != ERC721(0);
        if (hasParent) {
            if (supportsInterface(whichErc721, 0x7741746a)) {
                ERC721ComposableRegistryCallbacks(whichErc721).onComposableRegistryTransfer(p.erc721, p.tokenId, toErc721, toTokenId, whichTokenId);
            }
        } else {
            if (supportsInterface(whichErc721, 0xf3b8c02c)) {
                ERC721ComposableRegistryCallbacks(whichErc721).onComposableRegistryTransfer(msg.sender, toErc721, toTokenId, whichTokenId);
            }
        }
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        transferImpl(this, whichErc721, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        addChild(toErc721, toTokenId, whichErc721, whichTokenId);
        if (hasParent) {
            emit ERC721Transfer(p.erc721, p.tokenId, toErc721, toTokenId, whichErc721, whichTokenId);
        } else {
            emit ERC721Transfer(ownerOfWhichByErc721, toErc721, toTokenId, whichErc721, whichTokenId);
        }
    }

    function requireNoCircularDependency(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private view {
        do {
            require(toErc721 != whichErc721 || toTokenId != whichTokenId);
            TokenIdentifier memory p = childToParent[toErc721][toTokenId];
            toErc721 = p.erc721;
            toTokenId = p.tokenId;
        } while (toErc721 != ERC721(0));
    }

    function supportsInterface(address erc721, bytes4 id) private view returns (bool) {
        uint success;
        uint result;
        (success, result) = supportsInterfaceNoThrowCall(erc721, 0x01ffc9a7);
        if (success == 0 || result == 0) {
            return false;
        }
        (success, result) = supportsInterfaceNoThrowCall(erc721, 0xffffffff);
        if (success == 0 || result != 0) {
            return false;
        }
        (success, result) = supportsInterfaceNoThrowCall(erc721, id);
        return success == 1 && result == 1;
    }

    function supportsInterfaceNoThrowCall(address erc721, bytes4 id) private view returns (uint success, uint result) {
        bytes4 supportsInterfaceSignature = 0x01ffc9a7;
        assembly {
            let freeMem := mload(0x40)
            mstore(freeMem, supportsInterfaceSignature)
            mstore(add(freeMem, 4), id)
            success := staticcall(30000, erc721, freeMem, 0x20, freeMem, 0x20)
            result := mload(freeMem)
        }
    }

    function addChild(ERC721 toErc721, uint toTokenId, ERC721 whichErc721, uint whichTokenId) private {
        childToParent[whichErc721][whichTokenId] = TokenIdentifier(toErc721, toTokenId);
        uint length = parentToChildren[toErc721][toTokenId].push(TokenIdentifier(whichErc721, whichTokenId));
        childToIndexInParentToChildren[whichErc721][whichTokenId] = length - 1;
    }

    function transferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        require(whichErc721.ownerOf(whichTokenId) == address(this));
        address owner = ownerOf(whichErc721, whichTokenId);
        require(owner == msg.sender || isApproved(owner, msg.sender, whichErc721, whichTokenId));
        TokenIdentifier memory p = childToParent[whichErc721][whichTokenId];
        if (supportsInterface(whichErc721, 0xc34cfb3f)) {
            ERC721ComposableRegistryCallbacks(whichErc721).onComposableRegistryTransfer(p.erc721, p.tokenId, to, whichTokenId);
        }
        transferImpl(to, whichErc721, whichTokenId);
        removeFromParentToChildren(whichErc721, whichTokenId);
        delete childToParent[whichErc721][whichTokenId];
        delete childToIndexInParentToChildren[whichErc721][whichTokenId];
        emit ERC721Transfer(p.erc721, p.tokenId, to, whichErc721, whichTokenId);
    }

    function safeTransferToAddress(address to, ERC721 whichErc721, uint whichTokenId) public {
        safeTransferToAddress(to, whichErc721, whichTokenId, "");
    }

    function safeTransferToAddress(address to, ERC721 whichErc721, uint whichTokenId, bytes data) public {
        address owner = ownerOf(whichErc721, whichTokenId);
        require(owner == msg.sender || isApproved(owner, msg.sender, whichErc721, whichTokenId));
        TokenIdentifier memory p = childToParent[whichErc721][whichTokenId];
        if (supportsInterface(whichErc721, 0xc34cfb3f)) {
            ERC721ComposableRegistryCallbacks(whichErc721).onComposableRegistryTransfer(p.erc721, p.tokenId, to, whichTokenId);
        }
        whichErc721.safeTransferFrom(this, to, whichTokenId, data);
        removeFromParentToChildren(whichErc721, whichTokenId);
        delete childToParent[whichErc721][whichTokenId];
        delete childToIndexInParentToChildren[whichErc721][whichTokenId];
        emit ERC721Transfer(p.erc721, p.tokenId, to, whichErc721, whichTokenId);
    }

    function isApproved(address owner, address spender, ERC721 erc721, uint tokenId) public view returns (bool) {
        if (approvedAll[owner][spender]) {
            return true;
        }
        TokenIdentifier memory p = childToParent[erc721][tokenId];
        while (true) {
            if (approvedType[owner][spender][erc721]) {
                return true;
            } else if (approved[owner][erc721][tokenId] == spender) {
                return true;
            } else if (p.erc721 == ERC721(0)) {
                return erc721.getApproved(tokenId) == spender || erc721.isApprovedForAll(owner, spender);
            }
            erc721 = p.erc721;
            tokenId = p.tokenId;
            p = childToParent[erc721][tokenId];
        }
    }

    function multiTransferToAddress(address to, ERC721[] whichErc721s, uint[] whichTokenIds) public {
        for (uint i = 0; i < whichErc721s.length; i++) {
            transferToAddress(to, whichErc721s[i], whichTokenIds[i]);
        }
    }

    function transferImpl(address to, ERC721 whichErc721, uint whichTokenId) private {
        address ownerOfWhichByErc721 = whichErc721.ownerOf(whichTokenId);
        if (ownerOfWhichByErc721 != to) {
            address(whichErc721).call(/* approve(address,uint256) */ 0x095ea7b3, this, whichTokenId);
            whichErc721.transferFrom(ownerOfWhichByErc721, to, whichTokenId);
        }
    }

    function removeFromParentToChildren(ERC721 whichErc721, uint whichTokenId) private {
        TokenIdentifier memory p = childToParent[whichErc721][whichTokenId];
        if (p.erc721 != ERC721(0)) {
            TokenIdentifier[] storage c = parentToChildren[p.erc721][p.tokenId];
            uint index = childToIndexInParentToChildren[whichErc721][whichTokenId];
            uint last = c.length - 1;
            if (index < last) {
                c[index] = c[last];
            }
            c.length--;
        }
    }

    function approve(address spender, ERC721 erc721, uint tokenId) public {
        require(exists(erc721, tokenId));
        approved[msg.sender][erc721][tokenId] = spender;
    }

    function approveType(address spender, ERC721 erc721, bool value) public {
        approvedType[msg.sender][spender][erc721] = value;
    }

    function approveAll(address spender, bool value) public {
        approvedAll[msg.sender][spender] = value;
    }

    function ownerOf(ERC721 erc721, uint tokenId) public view returns (address) {
        TokenIdentifier memory p = childToParent[erc721][tokenId];
        while (p.erc721 != ERC721(0)) {
            erc721 = p.erc721;
            tokenId = p.tokenId;
            p = childToParent[erc721][tokenId];
        }
        return erc721.ownerOf(tokenId);
    }

    function parent(ERC721 erc721, uint tokenId) public view returns (ERC721, uint) {
        TokenIdentifier memory p = childToParent[erc721][tokenId];
        require(p.erc721 != ERC721(0));
        return (p.erc721, p.tokenId);
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

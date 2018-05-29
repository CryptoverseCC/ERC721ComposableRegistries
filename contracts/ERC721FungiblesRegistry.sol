pragma solidity ^0.4.23;

import "./ERC721ComposableRegistry.sol";

contract ERC20 {

    function transfer(address to, uint amount) public returns (bool);
    function transferFrom(address from, address to, uint amount) public returns (bool);
}

contract ERC721FungiblesRegistry {

    event ERC20Transfer(address from, address toErc721, uint toTokenId, address erc20, uint amount);
    event ERC20Transfer(address fromErc721, uint fromTokenId, address toErc721, uint toTokenId, address erc20, uint amount);
    event ERC20Transfer(address fromErc721, uint fromTokenId, address to, address erc20, uint amount);

    ERC721ComposableRegistry public composableRegistry;
    mapping (address => mapping (uint => mapping (address => uint))) private balances;
    bool private approved;

    constructor(ERC721ComposableRegistry cr) public {
        composableRegistry = cr;
    }

    function tokenFallback(address from, uint amount, bytes to) public returns (bytes4) {
        require(to.length == 64);
        ERC721 toErc721 = ERC721(address(bytesToUint(to, 0)));
        uint toTokenId = bytesToUint(to, 32);
        require(exists(toErc721, toTokenId));
        ERC20 erc20 = ERC20(msg.sender);
        balances[toErc721][toTokenId][erc20] += amount;
        emit ERC20Transfer(from, toErc721, toTokenId, erc20, amount);
        return 0xc0ee0b8a;
    }

    function receiveApproval(address from, uint amount, address /* token */, bytes to) public returns (bytes4) {
        receiveApproval(from, amount, to);
        return 0x8f4ffcb1;
    }

    function receiveApproval(address from, uint amount, bytes to) public returns (bytes4) {
        ERC20 erc20 = ERC20(msg.sender);
        require(erc20.transferFrom(from, this, amount));
        tokenFallback(from, amount, to);
        return 0xa2d57853;
    }

    function bytesToUint(bytes b, uint index) private pure returns (uint) {
        uint ret;
        for (uint i = index; i < index + 32; i++) {
            ret *= 256;
            ret += uint(b[i]);
        }
        return ret;
    }

    function transfer(ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        require(exists(toErc721, toTokenId));
        require(erc20.transferFrom(msg.sender, this, amount));
        balances[toErc721][toTokenId][erc20] += amount;
        emit ERC20Transfer(msg.sender, toErc721, toTokenId, erc20, amount);
    }

    function transferFrom(ERC721 fromErc721, uint fromTokenId, ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        require(composableRegistry.ownerOf(fromErc721, fromTokenId) == msg.sender);
        require(exists(toErc721, toTokenId));
        require(balanceOf(fromErc721, fromTokenId, erc20) >= amount);
        balances[fromErc721][fromTokenId][erc20] -= amount;
        balances[toErc721][toTokenId][erc20] += amount;
        emit ERC20Transfer(fromErc721, fromTokenId, toErc721, toTokenId, erc20, amount);
    }

    function exists(ERC721 erc721, uint tokenId) private view returns (bool) {
        return erc721.ownerOf(tokenId) != 0;
    }

    function transferToAddress(ERC721 fromErc721, uint fromTokenId, address to, ERC20 erc20, uint amount) public {
        require(composableRegistry.ownerOf(fromErc721, fromTokenId) == msg.sender || approved);
        require(balanceOf(fromErc721, fromTokenId, erc20) >= amount);
        balances[fromErc721][fromTokenId][erc20] -= amount;
        assert(erc20.transfer(to, amount));
        emit ERC20Transfer(fromErc721, fromTokenId, to, erc20, amount);
    }

    function approve(ERC721 fromErc721, uint fromTokenId, address spender, ERC20 erc20, uint amount) public {
        approved = true;
    }

    function balanceOf(ERC721 erc721, uint tokenId, ERC20 erc20) public view returns (uint) {
        return balances[erc721][tokenId][erc20];
    }
}

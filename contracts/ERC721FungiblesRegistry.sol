pragma solidity ^0.4.23;

import "./ERC721ComposableRegistry.sol";

contract ERC20 {

    function transferFrom(address from, address to, uint amount) public returns (bool);
}

contract ERC721FungiblesRegistry {

    ERC721ComposableRegistry public composableRegistry;
    mapping (address => mapping (uint => mapping (address => uint))) private balances;

    function ERC721FungiblesRegistry(ERC721ComposableRegistry cr) public {
        composableRegistry = cr;
    }

    function transfer(ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        balances[toErc721][toTokenId][erc20] += amount;
    }

    function transferFrom(ERC721 fromErc721, uint fromTokenId, ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        require(composableRegistry.ownerOf(fromErc721, fromTokenId) == msg.sender);
        require(balanceOf(fromErc721, fromTokenId, erc20) >= amount);
        balances[fromErc721][fromTokenId][erc20] -= amount;
        balances[toErc721][toTokenId][erc20] += amount;
    }

    function transferToAddress(ERC721 fromErc721, uint fromTokenId, address to, ERC20 erc20, uint amount) public {
        balances[fromErc721][fromTokenId][erc20] -= amount;
        require(erc20.transferFrom(msg.sender, to, amount));
    }

    function balanceOf(ERC721 erc721, uint tokenId, ERC20 erc20) public view returns (uint) {
        return balances[erc721][tokenId][erc20];
    }
}

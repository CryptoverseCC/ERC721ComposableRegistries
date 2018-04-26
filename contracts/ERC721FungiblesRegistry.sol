pragma solidity ^0.4.23;

contract ERC20 {
}

contract ERC721 {

    function ownerOf(uint tokenId) public view returns (address);
}

contract ERC721FungiblesRegistry {

    mapping (address => mapping (uint => mapping (address => uint))) private balances;

    function transfer(ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        balances[toErc721][toTokenId][erc20] += amount;
    }

    function transferFrom(ERC721 fromErc721, uint fromTokenId, ERC721 toErc721, uint toTokenId, ERC20 erc20, uint amount) public {
        require(fromErc721.ownerOf(fromTokenId) == msg.sender);
        require(balanceOf(fromErc721, fromTokenId, erc20) >= amount);
        balances[fromErc721][fromTokenId][erc20] -= amount;
        balances[toErc721][toTokenId][erc20] += amount;
    }

    function balanceOf(ERC721 erc721, uint tokenId, ERC20 erc20) public view returns (uint) {
        return balances[erc721][tokenId][erc20];
    }
}

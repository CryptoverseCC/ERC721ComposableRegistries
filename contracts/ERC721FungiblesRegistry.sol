pragma solidity ^0.4.23;

contract ERC20 {
}

contract ERC721 {
}

contract ERC721FungiblesRegistry {

    mapping (address => mapping (uint => mapping (address => uint))) private balances;

    function transfer(ERC721 erc721, uint tokenId, ERC20 erc20, uint amount) public {
        balances[erc721][tokenId][erc20] += amount;
    }

    function balanceOf(ERC721 erc721, uint tokenId, ERC20 erc20) public view returns (uint) {
        return balances[erc721][tokenId][erc20];
    }
}

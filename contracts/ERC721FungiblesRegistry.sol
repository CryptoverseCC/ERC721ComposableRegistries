pragma solidity ^0.4.23;

contract ERC20 {
}

contract ERC721 {
}

contract ERC721FungiblesRegistry {

    uint private balance;

    function transfer(ERC721 erc721, uint tokenId, ERC20 erc20, uint amount) public {
        balance = amount;
    }

    function balanceOf(ERC721 erc721, uint tokenId, ERC20 erc20) public view returns (uint) {
        return balance;
    }
}

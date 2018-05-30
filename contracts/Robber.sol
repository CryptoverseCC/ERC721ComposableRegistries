pragma solidity ^0.4.23;

import "./ERC721FungiblesRegistry.sol";

contract Robber {

    ERC721FungiblesRegistry private registry;

    constructor(ERC721FungiblesRegistry fr) public {
        registry = fr;
    }

    function steal20(ERC721 erc721, uint tokenId, ERC20 erc20, uint amount) public {
        registry.transferToAddress(erc721, tokenId, this, erc20, amount);
    }
}

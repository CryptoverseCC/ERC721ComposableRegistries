pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract SampleERC721 is ERC721Token("SampleERC721", "SAMPLE") {

    function create() public {
        uint256 tokenId = allTokens.length + 1;
        _mint(msg.sender, tokenId);
    }
}

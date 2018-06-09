pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract SampleNontransferableERC721 is ERC721Token("SampleNontransferableERC721", "NON") {

    function create(ERC721Receiver receiver, bytes to) public {
        uint tokenId = allTokens.length + 1;
        _mint(receiver, tokenId);
        receiver.onERC721Received(0, tokenId, to);
    }

    modifier canTransfer(uint) {
        revert();
        _;
    }
}

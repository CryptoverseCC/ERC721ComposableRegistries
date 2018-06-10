pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract SampleERC721 is ERC721Token("SampleERC721", "SAMPLE") {

    function create() public {
        uint tokenId = allTokens.length + 1;
        _mint(msg.sender, tokenId);
    }

    function fakeOnERC721Received(ERC721Receiver receiver, address from, uint tokenId, bytes data) public {
        receiver.onERC721Received(from, tokenId, data);
    }
}

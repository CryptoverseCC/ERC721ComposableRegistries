pragma solidity ^0.4.24;

import "@0xcert/ethereum-erc721/contracts/tokens/NFTokenEnumerable.sol";

contract SampleERC721 is NFTokenEnumerable {

    function create() public {
        uint tokenId = tokens.length + 1;
        _mint(msg.sender, tokenId);
    }

    function fakeOnERC721Received(ERC721TokenReceiver receiver, address from, uint tokenId, bytes data) public {
        receiver.onERC721Received(msg.sender, from, tokenId, data);
    }
}

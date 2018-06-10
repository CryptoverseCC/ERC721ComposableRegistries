pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract SupportsInterface {

    mapping(bytes4 => bool) internal supportedInterfaces;

    constructor() public {
        supportedInterfaces[0x01ffc9a7] = true;
    }

    function supportsInterface(bytes4 id) public view returns (bool) {
        return supportedInterfaces[id];
    }
}

contract SampleNontransferableERC721 is ERC721Token("SampleNontransferableERC721", "NON"), SupportsInterface {

    constructor() public {
        supportedInterfaces[0x7741746a] = true;
        supportedInterfaces[0xc34cfb3f] = true;
    }

    function create(ERC721Receiver receiver, bytes to) public {
        uint tokenId = allTokens.length + 1;
        _mint(receiver, tokenId);
        receiver.onERC721Received(0, tokenId, to);
    }

    function onComposableRegistryTransfer(address /* fromErc721 */, uint /* fromTokenId */, address /* toErc721 */, uint /* toTokenId */, uint /* whichTokenId */) public pure {
        revert();
    }

    function onComposableRegistryTransfer(address /* fromErc721 */, uint /* fromTokenId */, address /* to */, uint /* whichTokenId */) public pure {
    }
}

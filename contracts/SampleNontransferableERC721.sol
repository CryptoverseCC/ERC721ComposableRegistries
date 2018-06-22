pragma solidity ^0.4.24;

import "@0xcert/ethereum-erc721/contracts/tokens/NFTokenEnumerable.sol";

contract SampleNontransferableERC721 is NFTokenEnumerable {

    constructor() public {
        supportedInterfaces[0xf3b8c02c] = true;
        supportedInterfaces[0x7741746a] = true;
        supportedInterfaces[0xc34cfb3f] = true;
    }

    function createToken(ERC721TokenReceiver receiver, bytes to) public {
        uint tokenId = tokens.length + 1;
        _mint(receiver, tokenId);
        if (AddressUtils.isContract(receiver)) {
            receiver.onERC721Received(msg.sender, 0, tokenId, to);
        }
    }

    function onComposableRegistryTransfer(address from, address /* toErc721 */, uint /* toTokenId */, uint /* whichTokenId */) public view {
        require(from == 0 || from == owner);
    }

    function onComposableRegistryTransfer(address /* fromErc721 */, uint /* fromTokenId */, address /* toErc721 */, uint /* toTokenId */, uint /* whichTokenId */) public pure {
        revert();
    }

    function onComposableRegistryTransfer(address /* fromErc721 */, uint /* fromTokenId */, address /* to */, uint /* whichTokenId */) public pure {
        revert();
    }
}

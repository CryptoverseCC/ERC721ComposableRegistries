pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract SupportsInterface {

    mapping(bytes4 => bool) internal supportedInterfaces;

    constructor() public {
        supportedInterfaces[0x01ffc9a7] = true;
    }

    function supportsInterface(bytes4 id) public view returns (bool) {
        return supportedInterfaces[id];
    }
}

contract SampleNontransferableERC721 is ERC721Token("SampleNontransferableERC721", "NON"), Ownable, SupportsInterface {

    constructor() public {
        supportedInterfaces[0xf3b8c02c] = true;
        supportedInterfaces[0x7741746a] = true;
        supportedInterfaces[0xc34cfb3f] = true;
    }

    function createToken(ERC721Receiver receiver, bytes to) public {
        uint tokenId = allTokens.length + 1;
        _mint(receiver, tokenId);
        if (isContract(receiver)) {
            receiver.onERC721Received(0, tokenId, to);
        }
    }

    function isContract(address receiver) private view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(receiver)
        }
        return size > 0;
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

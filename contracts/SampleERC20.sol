pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract TokenReceiver {

    function tokenFallback(address from, uint amount, bytes data) public returns (bool);
}

contract SampleERC20 is MintableToken {

    function SampleERC20() {
        mint(msg.sender, 100);
    }

    function transferAndCall(address to, uint256 amount, bytes data) public {
        transfer(to, amount);
        bool isContract = false;
        assembly {
            isContract := not(iszero(extcodesize(to)))
        }
        if (isContract) {
            require(TokenReceiver(to).tokenFallback(msg.sender, amount, data));
        }
    }
}

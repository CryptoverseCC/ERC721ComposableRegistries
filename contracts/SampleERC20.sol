pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract TokenReceiver {

    function tokenFallback(address from, uint amount, bytes data) public returns (bool);
    function receiveApproval(address from, uint amount, address token, bytes data) public;
}

contract SampleERC20 is MintableToken {

    constructor() public {
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

    function approveAndCall(address spender, uint256 amount, bytes data) public {
        allowed[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        TokenReceiver(spender).receiveApproval(msg.sender, amount, this, data);
    }
}

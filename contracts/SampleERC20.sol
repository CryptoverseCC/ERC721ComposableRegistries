pragma solidity ^0.4.24;

import "@0xcert/ethereum-erc20/contracts/mocks/TokenMock.sol";
import "@0xcert/ethereum-utils/contracts/utils/AddressUtils.sol";

contract TokenReceiver {

    function tokenFallback(address from, uint amount, bytes data) public returns (bool);
    function receiveApproval(address from, uint amount, address token, bytes data) public;
}

contract SampleERC20 is TokenMock {

    function transferAndCall(address to, uint256 amount, bytes data) public {
        super.transfer(to, amount);
        if (AddressUtils.isContract(to)) {
            require(TokenReceiver(to).tokenFallback(msg.sender, amount, data));
        }
    }

    function approveAndCall(address spender, uint256 amount, bytes data) public {
        allowed[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        TokenReceiver(spender).receiveApproval(msg.sender, amount, this, data);
    }
}

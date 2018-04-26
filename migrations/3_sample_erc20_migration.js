var SampleERC20 = artifacts.require("./SampleERC20.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleERC20);
};

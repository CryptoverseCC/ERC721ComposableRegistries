var SampleERC721 = artifacts.require("./SampleERC721.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleERC721);
};

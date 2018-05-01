var SampleERC721 = artifacts.require("./SampleERC721.sol");
var SampleNontransferableERC721 = artifacts.require("./SampleNontransferableERC721.sol");
var SampleCryptoKitties = artifacts.require("./SampleCryptoKitties.sol");

module.exports = function(deployer) {
  deployer.deploy(SampleERC721);
  deployer.deploy(SampleNontransferableERC721);
  deployer.deploy(SampleCryptoKitties);
};

var ERC721FungiblesRegistry = artifacts.require("./ERC721FungiblesRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC721FungiblesRegistry);
};

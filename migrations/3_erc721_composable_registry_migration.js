var ERC721ComposableRegistry = artifacts.require("./ERC721ComposableRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC721ComposableRegistry);
};

const ERC721ComposableRegistry = artifacts.require("./ERC721ComposableRegistry.sol");
const ERC721FungiblesRegistry = artifacts.require("./ERC721FungiblesRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(ERC721ComposableRegistry).then(function() {
        return deployer.deploy(ERC721FungiblesRegistry, ERC721ComposableRegistry.address);
    });
};

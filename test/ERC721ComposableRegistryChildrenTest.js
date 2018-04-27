const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has no children", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });
});

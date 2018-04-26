const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can safely transfer to registry", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        await erc721.safeTransferFrom(accounts[0], registry.address, 2);
        const owner = await registry.ownerOf(erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });
});

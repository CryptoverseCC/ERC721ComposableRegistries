const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("Token has a parent", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const parent = await this.registry.parent(this.erc721.address, 2);
        assert.equal(parent[0], this.erc721.address);
        assert.equal(parent[1], 1);
    });

    it("Checking parent when not owned by registry should fail", async () => {
        try {
            await this.registry.parent(this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

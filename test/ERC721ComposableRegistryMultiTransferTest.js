const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("Token has two tokens after multi transfer", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 2);
        assert.equal(children[1].length, 2);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
        assert.equal(children[0][1], this.erc721.address);
        assert.equal(children[1][1], 3);
    });

    it("Token no longer has tokens after multi transfer to other token", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        await this.registry.multiTransfer(this.erc721.address, 4, [this.erc721.address, this.erc721.address], [2, 3]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });
});

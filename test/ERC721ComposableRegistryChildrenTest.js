const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("Token has no children", async () => {
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Token has a child", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
    });

    it("Token no longer has children", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transferToAddress(accounts[0], this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Token no longer has children", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Token has only one child after transferring another", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 3);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
    });

    it("Token has only another child after transferring first", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 3);
    });

    it("Token still has a child after transferring one to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        await this.registry.transferToAddress(accounts[0], this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 3);
    });
});

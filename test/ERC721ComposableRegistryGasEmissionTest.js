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

    it("First transfer gas use", async () => {
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        //console.log(r);
        assert.ok(r.receipt.gasUsed <= 254236);
    });

    it("Second transfer gas use", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        //console.log(r);
        assert.ok(r.receipt.gasUsed <= 239236);
    });

    it("First transfer to address gas use", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transferToAddress(accounts[1], this.erc721.address, 2);
        //console.log(r);
        assert.ok(r.receipt.gasUsed <= 104349);
    });

    it("Second transfer to address gas use", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        await this.registry.transferToAddress(accounts[1], this.erc721.address, 2);
        const r = await this.registry.transferToAddress(accounts[1], this.erc721.address, 3);
        //console.log(r);
        assert.ok(r.receipt.gasUsed <= 96849);
    });

    it("Transfer from token to token gas use", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 3);
        const r = await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 3);
        //console.log(r);
        assert.ok(r.receipt.gasUsed <= 166424);
    });
});

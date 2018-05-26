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

    it("Transfer event is emitted after transfer to token", async () => {
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.from, accounts[0]);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 1);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("Transfer event is emitted after transfer from token to token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 3);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("Transfer event is emitted after transfer to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transferToAddress(accounts[1], this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.to, accounts[1]);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });
});

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const ERC721FungiblesRegistry = artifacts.require("ERC721FungiblesRegistry.sol");
const SampleERC20 = artifacts.require("SampleERC20.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721FungiblesRegistry', (accounts) => {

    beforeEach(async () => {
        this.composableRegistry = await ERC721ComposableRegistry.new();
        this.registry = await ERC721FungiblesRegistry.new(this.composableRegistry.address);
        this.erc20 = await SampleERC20.new();
        await this.erc20.approve(this.registry.address, 999);
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
    });

    it("Transfer event is emitted after transfer to token", async () => {
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC20Transfer');
        const args = r.logs[0].args;
        assert.equal(args.from, accounts[0]);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 1);
        assert.equal(args.erc20, this.erc20.address);
        assert.equal(args.amount, 50);
    });

    it("Transfer event is emitted after transfer from token to token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        const r = await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 20);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC20Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 2);
        assert.equal(args.erc20, this.erc20.address);
        assert.equal(args.amount, 20);
    });
});

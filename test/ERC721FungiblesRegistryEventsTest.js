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
    });

    it("Transfer event is emitted after transfer to token", async () => {
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC20Transfer');
        const args = r.logs[0].args;
        console.log(args.from, accounts[0]);
        console.log(args.toErc721, this.erc721.address);
        console.log(args.toTokenId, 1);
        console.log(args.erc20, this.erc20.address);
        console.log(args.amount, 50);
    });
});

const keccak = require('js-sha3').keccak_256;

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

    it("Transfer event is emitted after transfer to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        const r = await this.registry.transferToAddress(this.erc721.address, 1, accounts[1], this.erc20.address, 30);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC20Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.to, accounts[1]);
        assert.equal(args.erc20, this.erc20.address);
        assert.equal(args.amount, 30);
    });

    it("Transfer event is emitted after safe transfer", async () => {
        const to = formatToByteArray(this.erc721.address, 1);
        const r = await this.erc20.transferAndCall(this.registry.address, 50, to);
        assert.equal(r.receipt.logs.length, 2);
        const l = r.receipt.logs[1];
        assert.equal(l.topics.length, 1);
        assert.equal(l.topics[0], '0x' + keccak('ERC20Transfer(address,address,uint256,address,uint256)'));
        assert.equal(addressAtIndex(l.data, 0), accounts[0]);
        assert.equal(addressAtIndex(l.data, 1), this.erc721.address);
        assert.equal(intAtIndex(l.data, 2), 1);
        assert.equal(addressAtIndex(l.data, 3), this.erc20.address);
        assert.equal(intAtIndex(l.data, 4), 50);
    });
});

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

function addressAtIndex(data, index) {
    return '0x' + data.substring(2 + 64 * index + 24, 2 + 64 * (index + 1));
}

function intAtIndex(data, index) {
    return parseInt(data.substring(2 + 64 * index, 2 + 64 * (index + 1)), 16);
}

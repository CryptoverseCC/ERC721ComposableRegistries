const keccak = require('js-sha3').keccak_256;

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const ERC721FungiblesRegistry = artifacts.require("ERC721FungiblesRegistry.sol");
const SampleERC20 = artifacts.require("SampleERC20.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");
const Robber = artifacts.require("Robber.sol");

contract('ERC721FungiblesRegistry', (accounts) => {

    beforeEach(async () => {
        this.composableRegistry = await ERC721ComposableRegistry.new();
        this.registry = await ERC721FungiblesRegistry.new(this.composableRegistry.address);
        this.erc20 = await SampleERC20.new();
        await this.erc20.approve(this.registry.address, 100);
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 100);
        this.robber = await Robber.new(this.registry.address);
    });

    it("Robber can steal erc20 when approved", async () => {
        await this.registry.approve(this.erc721.address, 1, this.robber.address, this.erc20.address, 50);
        await this.robber.steal20(this.erc721.address, 1, this.erc20.address, 50);
        const balance = await this.erc20.balanceOf(this.robber.address);
        assert.equal(balance.toNumber(), 50);
    });
});

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
        await this.erc20.approve(this.registry.address, 100);
        this.erc721 = await SampleERC721.new();
        await this.erc721.create({from: accounts[1]});
        await this.erc721.create({from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
    });

    it("I can transfer erc20 when approved", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[2], this.erc20.address, 50);
        const balance = await this.erc20.balanceOf(accounts[2]);
        assert.equal(balance.toNumber(), 50);
    });

    it("I cannot transfer erc20 when someone else is approved", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[2], this.erc20.address, 50, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 50);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer erc20 from other token", async () => {
        await this.erc721.create({from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 2, this.erc20.address, 50);
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 2, accounts[0], this.erc20.address, 50);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer more erc20 than approved", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 25, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 26);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer more erc20 than approved on second attempt", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 25, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 25);
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer different erc20", async () => {
        const differentErc20 = await SampleERC20.new();
        await differentErc20.approve(this.registry.address, 100);
        await this.registry.transfer(this.erc721.address, 1, differentErc20.address, 100);
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], differentErc20, 50);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer erc20 multiple times", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[2], this.erc20.address, 20);
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[2], this.erc20.address, 20);
        const balance = await this.erc20.balanceOf(accounts[2]);
        assert.equal(balance.toNumber(), 40);
    });

    it("I cannot transfer erc20 when approved by non-owner", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[2]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 50);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer erc20 to other token when approved", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 50, {from: accounts[1]});
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 50);
        const balance = await this.registry.balanceOf(this.erc721.address, 2, this.erc20.address);
        assert.equal(balance.toNumber(), 50);
    });

    it("On second attempt I cannot transfer more erc20 to other token than approved", async () => {
        await this.registry.approve(this.erc721.address, 1, accounts[0], this.erc20.address, 25, {from: accounts[1]});
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 25);
        try {
            await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer erc20 when approved via composable registry", async () => {
        await this.composableRegistry.approve(accounts[0], this.erc721.address, 1, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[2], this.erc20.address, 50);
        const balance = await this.erc20.balanceOf(accounts[2]);
        assert.equal(balance.toNumber(), 50);
    });

    it("I can transfer erc20 when approved for all via composable registry", async () => {
        await this.composableRegistry.approveAll(accounts[0], true, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[2], this.erc20.address, 50);
        const balance = await this.erc20.balanceOf(accounts[2]);
        assert.equal(balance.toNumber(), 50);
    });

    it("I can transfer erc20 to token when approved for all via composable registry", async () => {
        await this.composableRegistry.approveAll(accounts[0], true, {from: accounts[1]});
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 50);
        const balance = await this.registry.balanceOf(this.erc721.address, 2, this.erc20.address);
        assert.equal(balance.toNumber(), 50);
    });

    it("I cannot transfer erc20 when not longer approved via composable registry", async () => {
        await this.composableRegistry.approveAll(accounts[0], true, {from: accounts[1]});
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 1);
        await this.composableRegistry.approveAll(accounts[0], false, {from: accounts[1]});
        try {
            await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer erc20 to address when not longer approved via composable registry", async () => {
        await this.composableRegistry.approveType(accounts[0], this.erc721.address, true, {from: accounts[1]});
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 1);
        await this.composableRegistry.approveType(accounts[0], this.erc721.address, false, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[0], this.erc20.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

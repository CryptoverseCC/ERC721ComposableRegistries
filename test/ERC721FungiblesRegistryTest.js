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
        await this.erc721.create({from: accounts[1]});
        await this.erc721.setApprovalForAll(this.composableRegistry.address, true);
    });

    it("My token has zero balance", async () => {
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 0);
    });

    it("My token has non-zero balance", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 50);
    });

    it("My token's balance is increased", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 20);
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 20);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 40);
    });

    it("My other token's balance stays zero", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        const balance = await this.registry.balanceOf(this.erc721.address, 2, this.erc20.address);
        assert.equal(balance, 0);
    });

    it("My token can transfer to other token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 20);
        const balance = await this.registry.balanceOf(this.erc721.address, 2, this.erc20.address);
        assert.equal(balance, 20);
    });

    it("My token's balance is decreased", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 20);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 30);
    });

    it("My token cannot transfer more than it owns", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        try {
            await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 51);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer from his token", async () => {
        await this.registry.transfer(this.erc721.address, 3, this.erc20.address, 50);
        try {
            await this.registry.transferFrom(this.erc721.address, 3, this.erc721.address, 1, this.erc20.address, 20);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Token of my token can transfer", async () => {
        await this.composableRegistry.transfer(this.erc721.address, 2, this.erc721.address, 1);
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 2, this.erc20.address, 20);
        const balance = await this.registry.balanceOf(this.erc721.address, 2, this.erc20.address);
        assert.equal(balance, 20);
    });

    it("My token can transfer to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[1], this.erc20.address, 20);
        const balance = await this.erc20.balanceOf(accounts[1]);
        assert.equal(balance, 20);
    });

    it("My token's balance is decreased", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        await this.registry.transferToAddress(this.erc721.address, 1, accounts[1], this.erc20.address, 20);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 30);
    });

    it("My token cannot transfer more than it owns", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, accounts[1], this.erc20.address, 51);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer from his token", async () => {
        await this.registry.transfer(this.erc721.address, 3, this.erc20.address, 50);
        try {
            await this.registry.transferToAddress(this.erc721.address, 3, accounts[1], this.erc20.address, 20);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("He can withdraw from his token", async () => {
        await this.registry.transfer(this.erc721.address, 3, this.erc20.address, 50);
        await this.registry.transferToAddress(this.erc721.address, 3, accounts[1], this.erc20.address, 20, {from: accounts[1]});
        const balance = await this.erc20.balanceOf(accounts[1]);
        assert.equal(balance, 20);
    });

    it("I cannot transfer to non-existing token", async () => {
        try {
            await this.registry.transfer(this.erc721.address, 6, this.erc20.address, 50);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("My token cannot transfer to non-existing token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        try {
            await this.registry.transferFrom(this.erc721.address, 1, this.erc721.address, 6, this.erc20.address, 20);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer to registry address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc20.address, 50);
        try {
            await this.registry.transferToAddress(this.erc721.address, 1, this.registry.address, this.erc20.address, 20);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

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
        await this.erc721.create({from: accounts[1]});
        await this.erc721.setApprovalForAll(this.registry.address, true, {from: accounts[1]});
    });

    it("I'm owner of my token", async () => {
        const owner = await this.registry.ownerOf(this.erc721.address, 1);
        assert.equal(owner, accounts[0]);
    });

    it("He's owner of his token", async () => {
        const owner = await this.registry.ownerOf(this.erc721.address, 4);
        assert.equal(owner, accounts[1]);
    });

    it("He's owner of token owned by his token", async () => {
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 1);
        const owner = await this.registry.ownerOf(this.erc721.address, 1);
        assert.equal(owner, accounts[1]);
    });

    it("I cannot transfer his token", async () => {
        try {
            await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 4);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer to non-existing token", async () => {
        try {
            await this.registry.transfer(this.erc721.address, 6, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Registry physically owns child token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const owner = await this.erc721.ownerOf(2);
        assert.equal(owner, this.registry.address);
    });

    it("I can transfer token of my token to myself", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transferToAddress(accounts[0], this.erc721.address, 2);
        const owner = await this.erc721.ownerOf(2);
        assert.equal(owner, accounts[0]);
    });

    it("Ownership is a transitive relation", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 3);
        const owner = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(owner, accounts[0]);
    });

    it("I cannot transfer a token owned by his token", async () => {
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
        try {
            await this.registry.transferToAddress(accounts[0], this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I am not owner of token I sent to him", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transferToAddress(accounts[1], this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("I cannot transfer to address token I own directly", async () => {
        try {
            await this.registry.transferToAddress(accounts[1], this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer parent to be child of its child", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        try {
            await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer token to itself", async () => {
        try {
            await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer token to be child of its grandchild", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 3);
        try {
            await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer to registry address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        try {
            await this.registry.transferToAddress(this.registry.address, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

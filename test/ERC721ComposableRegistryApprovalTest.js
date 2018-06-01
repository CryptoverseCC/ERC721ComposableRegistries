const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create({from: accounts[1]});
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create({from: accounts[2]});
        await this.erc721.setApprovalForAll(this.registry.address, true);
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.transfer(this.erc721.address, 2, this.erc721.address, 3);
    });

    it("I can transfer approved token", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 2, {from: accounts[1]});
        await this.registry.transferToAddress(accounts[2], this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[2]);
    });

    it("I cannot transfer when someone else is approved", async () => {
        await this.registry.approve(accounts[2], this.erc721.address, 2, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(accounts[2], this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer when non-owner approves", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 2, {from: accounts[2]});
        try {
            await this.registry.transferToAddress(accounts[2], this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer when child token is approved", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 3, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(accounts[2], this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer when parent token is approved", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 2, {from: accounts[1]});
        await this.registry.transferToAddress(accounts[2], this.erc721.address, 3);
        const owner = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(owner, accounts[2]);
    });

    it("I cannot transfer when root token is approved via registry", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 1, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(accounts[2], this.erc721.address, 3);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer when root token is approved via erc721", async () => {
        await this.erc721.approve(accounts[0], 1, {from: accounts[1]});
        await this.registry.transferToAddress(accounts[2], this.erc721.address, 3);
        const owner = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(owner, accounts[2]);
    });

    it("I can transfer when owner of root approved for all", async () => {
        await this.erc721.setApprovalForAll(accounts[0], true, {from: accounts[1]});
        await this.registry.transferToAddress(accounts[2], this.erc721.address, 3);
        const owner = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(owner, accounts[2]);
    });

    it("I cannot transfer when root token is approved for someone else", async () => {
        await this.erc721.approve(accounts[2], 1, {from: accounts[1]});
        try {
            await this.registry.transferToAddress(accounts[2], this.erc721.address, 3);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer approved token to token", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 2, {from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[2]);
    });

    it("I can transfer child of approved token to token", async () => {
        await this.registry.approve(accounts[0], this.erc721.address, 2, {from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 3);
        const owner = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(owner, accounts[2]);
    });

    it("I can transfer approved root token to token", async () => {
        await this.erc721.setApprovalForAll(this.registry.address, true, {from: accounts[1]});
        await this.erc721.approve(accounts[0], 1, {from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 1);
        const owner = await this.registry.ownerOf(this.erc721.address, 1);
        assert.equal(owner, accounts[2]);
    });

    it("I can transfer when approved for all", async () => {
        await this.registry.approveAll(accounts[0], {from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[2]);
    });

    it("I cannot transfer when someone else is approved for all", async () => {
        await this.registry.approveAll(accounts[2], {from: accounts[1]});
        try {
            await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer when someone else approved me for all", async () => {
        await this.registry.approveAll(accounts[0], {from: accounts[2]});
        try {
            await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I can transfer when approved for type", async () => {
        await this.registry.approveType(accounts[0], this.erc721.address, {from: accounts[1]});
        await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[2]);
    });

    it("I cannot transfer when someone else is approved for type", async () => {
        await this.registry.approveType(accounts[2], this.erc721.address, {from: accounts[1]});
        try {
            await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer when someone else approved me for type", async () => {
        await this.registry.approveType(accounts[0], this.erc721.address, {from: accounts[2]});
        try {
            await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer when approved for different type", async () => {
        const differentErc721 = await SampleERC721.new();
        await this.registry.approveType(accounts[0], differentErc721.address, {from: accounts[1]});
        try {
            await this.registry.transfer(this.erc721.address, 4, this.erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

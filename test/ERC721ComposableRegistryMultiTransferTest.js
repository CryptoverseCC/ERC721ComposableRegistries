const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
        await this.erc721.create({from: accounts[1]});
        await this.erc721.setApprovalForAll(this.registry.address, true, {from: accounts[1]});
    });

    it("Token has two tokens after multi transfer", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 2);
        assert.equal(children[1].length, 2);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
        assert.equal(children[0][1], this.erc721.address);
        assert.equal(children[1][1], 3);
    });

    it("Token no longer has tokens after multi transfer to other token", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        await this.registry.multiTransfer(this.erc721.address, 4, [this.erc721.address, this.erc721.address], [2, 3]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Cannot transfer to non-existing token", async () => {
        try {
            await this.registry.multiTransfer(this.erc721.address, 6, [this.erc721.address, this.erc721.address], [2, 3]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Registry owns tokens after multi transfer", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        const ownerOfTokenTwo = await this.erc721.ownerOf(2);
        const ownerOfTokenThree = await this.erc721.ownerOf(3);
        assert.equal(ownerOfTokenTwo, this.registry.address);
        assert.equal(ownerOfTokenThree, this.registry.address);
    });

    it("Cannot transfer his token", async () => {
        try {
            await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address], [5]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer to child token", async () => {
        await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 1);
        try {
            await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I am not owner of tokens I sent to him", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        await this.registry.multiTransferToAddress(accounts[1], [this.erc721.address, this.erc721.address], [2, 3]);
        const ownerOfTokenTwo = await this.registry.ownerOf(this.erc721.address, 2);
        const ownerOfTokenThree = await this.registry.ownerOf(this.erc721.address, 3);
        assert.equal(ownerOfTokenTwo, accounts[1]);
        assert.equal(ownerOfTokenThree, accounts[1]);
    });

    it("Token has no children after transfer to address", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        await this.registry.multiTransferToAddress(accounts[1], [this.erc721.address, this.erc721.address], [2, 3]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Cannot transfer from his token", async () => {
        await this.registry.multiTransfer(this.erc721.address, 5, [this.erc721.address, this.erc721.address], [2, 3]);
        try {
            await this.registry.multiTransferToAddress(accounts[1], [this.erc721.address, this.erc721.address], [2, 3]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

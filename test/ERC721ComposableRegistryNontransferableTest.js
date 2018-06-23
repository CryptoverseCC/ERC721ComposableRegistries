const { safeTransferFrom, safeTransferToAddress, formatToByteArray } = require('./Utils');

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");
const SampleNontransferableERC721 = artifacts.require("SampleNontransferableERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        this.nontransferable721 = await SampleNontransferableERC721.new();
        const to = formatToByteArray(this.erc721.address, 1);
        await this.nontransferable721.createToken(this.registry.address, to);
    });

    it("Cannot transfer nontransferable token", async () => {
        try {
            await this.registry.transfer(this.erc721.address, 2, this.nontransferable721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot transfer nontransferable token to address", async () => {
        try {
            await this.registry.transferToAddress(accounts[0], this.nontransferable721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot safe transfer nontransferable token to address", async () => {
        try {
            safeTransferToAddress(accounts[0], this.registry.address, [accounts[0], this.nontransferable721.address, 1]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Owner can transfer 'nontransferable' token from address", async () => {
        await this.nontransferable721.createToken(accounts[0], '');
        await this.nontransferable721.setApprovalForAll(this.registry.address, true);
        await this.registry.transfer(this.erc721.address, 2, this.nontransferable721.address, 2);
        const parent = await this.registry.parent(this.nontransferable721.address, 2);
        assert.equal(parent[0], this.erc721.address);
        assert.equal(parent[1], 2);
    });

    it("Someone else cannot transfer nontransferable token from address", async () => {
        await this.nontransferable721.createToken(accounts[1], '');
        await this.nontransferable721.setApprovalForAll(this.registry.address, true, {from: accounts[1]});
        try {
            await this.registry.transfer(this.erc721.address, 2, this.nontransferable721.address, 2, {from: accounts[1]});
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Someone else cannot safe transfer nontransferable token", async () => {
        await this.nontransferable721.createToken(accounts[1], '');
        try {
            safeTransferFrom(accounts[1], this.registry.address, this.erc721.address, 2, this.nontransferable721.address, 2, {from: accounts[1]});
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

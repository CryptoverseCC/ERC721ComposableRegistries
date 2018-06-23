const { safeTransferToAddress, formatToByteArray, addressAtIndex, intAtIndex } = require('./Utils');
const keccak = require('js-sha3').keccak_256;

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
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
    });

    it("I can safe transfer to address", async () => {
        safeTransferToAddress(accounts[0], this.registry.address, [accounts[1], this.erc721.address, 2]);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("He cannot safe transfer my tokens to address", async () => {
        try {
            safeTransferToAddress(accounts[1], this.registry.address, [accounts[1], this.erc721.address, 2]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("He can safe transfer approved tokens to address", async () => {
        await this.registry.approve(accounts[1], this.erc721.address, 2);
        safeTransferToAddress(accounts[1], this.registry.address, [accounts[1], this.erc721.address, 2]);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("Token has no children after safe transfer", async () => {
        safeTransferToAddress(accounts[0], this.registry.address, [accounts[1], this.erc721.address, 2]);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Event is emitted after safe transfer", async () => {
        const r = safeTransferToAddress(accounts[0], this.registry.address, [accounts[1], this.erc721.address, 2]);
        assert.equal(r.logs.length, 3);
        const l = r.logs[2];
        assert.equal(l.topics.length, 1);
        assert.equal(l.topics[0], '0x' + keccak('ERC721Transfer(address,uint256,address,address,uint256)'));
        assert.equal(addressAtIndex(l.data, 0), this.erc721.address);
        assert.equal(intAtIndex(l.data, 1), 1);
        assert.equal(addressAtIndex(l.data, 2), accounts[1]);
        assert.equal(addressAtIndex(l.data, 3), this.erc721.address);
        assert.equal(intAtIndex(l.data, 4), 2);
    });

    it("I can safe transfer to address with data", async () => {
        safeTransferToAddress(accounts[0], this.registry.address, [accounts[1], this.erc721.address, 2, '0xdeadbeef']);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("Different registry accepts token and assigns parent", async () => {
        const differentRegistry = await ERC721ComposableRegistry.new();
        const to = formatToByteArray(this.erc721.address, 3);
        safeTransferToAddress(accounts[0], this.registry.address, [differentRegistry.address, this.erc721.address, 2, to]);
        const parent = await differentRegistry.parent(this.erc721.address, 2);
        assert.equal(parent[0], this.erc721.address);
        assert.equal(parent[1], 3);
    });

    it("Cannot safe transfer to registry address", async () => {
        const to = formatToByteArray(this.erc721.address, 1);
        try {
            safeTransferToAddress(accounts[0], this.registry.address, [this.registry.address, this.erc721.address, 2, to]);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("I'm owner of my token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        const owner = await registry.ownerOf(erc721.address, 1);
        assert.equal(owner, accounts[0]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("He's owner of his token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        const owner = await registry.ownerOf(erc721.address, 1);
        assert.equal(owner, accounts[1]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("He's owner of token owned by his token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        const owner = await registry.ownerOf(erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I cannot transfer his token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        try {
            await registry.transfer(erc721.address, 2, erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I cannot transfer to non-existing token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        try {
            await registry.transfer(erc721.address, 6, erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Registry physically owns child token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        const owner = await erc721.ownerOf(2);
        assert.equal(owner, registry.address);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can transfer token of my token to myself", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transferToAddress(accounts[0], erc721.address, 2);
        const owner = await erc721.ownerOf(2);
        assert.equal(owner, accounts[0]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Ownership is a transitive relation", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.setApprovalForAll(registry.address, true);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transfer(erc721.address, 2, erc721.address, 3);
        const owner = await registry.ownerOf(erc721.address, 3);
        assert.equal(owner, accounts[0]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I cannot transfer a token owned by his token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        try {
            await registry.transferToAddress(accounts[0], erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I am not owner of token I sent to him", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transferToAddress(accounts[1], erc721.address, 2);
        const owner = await registry.ownerOf(erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can transfer to address token I own directly", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.approve(registry.address, 1);
        await registry.transferToAddress(accounts[1], erc721.address, 1);
        const owner = await registry.ownerOf(erc721.address, 1);
        assert.equal(owner, accounts[1]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Cannot transfer parent to be child of its child", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.setApprovalForAll(registry.address, true);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        try {
            await registry.transfer(erc721.address, 2, erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

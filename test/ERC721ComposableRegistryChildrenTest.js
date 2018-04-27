const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has no children", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has a child", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], erc721.address);
        assert.equal(children[1][0], 2);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token no longer has children", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transferToAddress(accounts[0], erc721.address, 2);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token no longer has children", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transfer(erc721.address, 3, erc721.address, 2);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has only one child after transferring another", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.setApprovalForAll(registry.address, true);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 3);
        await registry.transfer(erc721.address, 2, erc721.address, 3);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], erc721.address);
        assert.equal(children[1][0], 2);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has only another child after transferring first", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.setApprovalForAll(registry.address, true);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 3);
        await registry.transfer(erc721.address, 3, erc721.address, 2);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], erc721.address);
        assert.equal(children[1][0], 3);
    });
});

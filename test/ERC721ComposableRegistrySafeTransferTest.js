const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

const web3Abi = require('web3-eth-abi');

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can safely transfer to registry", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        await safeTransferFrom(accounts[0], registry.address, erc721.address, 1, erc721.address, 2);
        const owner = await registry.ownerOf(erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Registry does not accept random calls about received token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        try {
            const to = formatToByteArray(erc721.address, 1);
            await erc721.fakeOnERC721Received(registry.address, accounts[0], 2, to);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("I cannot transfer token owned by another token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        try {
            const to = formatToByteArray(erc721.address, 3);
            await erc721.fakeOnERC721Received(registry.address, accounts[0], 2, to);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Cannot safe-transfer to non-existing token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        try {
            await safeTransferFrom(accounts[0], registry.address, erc721.address, 6, erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Cannot safe-transfer token to itself", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        try {
            await safeTransferFrom(accounts[0], registry.address, erc721.address, 1, erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Format passed to safeTransferFrom must be (erc721address + tokenId)", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        try {
            const to = formatToByteArray(erc721.address, 1) + 'F'.repeat(64);
            await safeTransferFromImpl(accounts[0], registry.address, to, erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has a child after safe transfer", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await safeTransferFrom(accounts[0], registry.address, erc721.address, 1, erc721.address, 2);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], erc721.address);
        assert.equal(children[1][0], 2);
    });
});

contract('ERC721ComposableRegistry', (accounts) => {

    it("Token has correct child after safe transfer and back to address", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await erc721.create();
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await safeTransferFrom(accounts[0], registry.address, erc721.address, 1, erc721.address, 3);
        await registry.transferToAddress(accounts[0], erc721.address, 3);
        const children = await registry.children(erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], erc721.address);
        assert.equal(children[1][0], 2);
    });
});

async function safeTransferFrom(from, registryAddress, toErc721, toTokenId, whichErc721, whichTokenId) {
    const to = formatToByteArray(toErc721, toTokenId);
    await safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId);
}

async function safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId) {
    const transferMethodTransactionData = web3Abi.encodeFunctionCall(
        SampleERC721.abi[13], [from, registryAddress, whichTokenId, to]
    );
    await web3.eth.sendTransaction({
        from, to: whichErc721, data: transferMethodTransactionData, value: 0, gas: 500000
    });
}

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

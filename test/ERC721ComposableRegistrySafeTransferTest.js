const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

const web3Abi = require('web3-eth-abi');

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can safely transfer to registry", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '1'.padStart(64, '0');
        const transferMethodTransactionData = web3Abi.encodeFunctionCall(
            SampleERC721.abi[13], [accounts[0], registry.address, 2, to]
        );
        await web3.eth.sendTransaction({
            from: accounts[0], to: erc721.address, data: transferMethodTransactionData, value: 0, gas: 500000
        });
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
            const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '1'.padStart(64, '0');
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
            const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '3'.padStart(64, '0');
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
            const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '6'.padStart(64, '0');
            const transferMethodTransactionData = web3Abi.encodeFunctionCall(
                SampleERC721.abi[13], [accounts[0], registry.address, 1, to]
            );
            await web3.eth.sendTransaction({
                from: accounts[0], to: erc721.address, data: transferMethodTransactionData, value: 0, gas: 500000
            });
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
            const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '1'.padStart(64, '0');
            const transferMethodTransactionData = web3Abi.encodeFunctionCall(
                SampleERC721.abi[13], [accounts[0], registry.address, 1, to]
            );
            await web3.eth.sendTransaction({
                from: accounts[0], to: erc721.address, data: transferMethodTransactionData, value: 0, gas: 500000
            });
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

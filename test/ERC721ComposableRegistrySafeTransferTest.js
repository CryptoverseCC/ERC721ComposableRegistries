const web3Abi = require('web3-eth-abi');

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create({from: accounts[1]});
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("I can safely transfer to registry", async () => {
        safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 1, this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("Registry does not accept random calls about received token", async () => {
        try {
            const to = formatToByteArray(this.erc721.address, 1);
            await this.erc721.fakeOnERC721Received(this.registry.address, accounts[0], 2, to);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("I cannot transfer token owned by another token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        try {
            const to = formatToByteArray(this.erc721.address, 3);
            await this.erc721.fakeOnERC721Received(this.registry.address, accounts[0], 2, to);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot safe-transfer to non-existing token", async () => {
        try {
            safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 6, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Cannot safe-transfer token to itself", async () => {
        try {
            safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 1, this.erc721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Format passed to safeTransferFrom must be (erc721address + tokenId)", async () => {
        try {
            const to = formatToByteArray(erc721.address, 1) + 'F'.repeat(64);
            safeTransferFromImpl(accounts[0], registry.address, to, erc721.address, 2);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("Token has a child after safe transfer", async () => {
        safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 1, this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
    });

    it("Token has correct child after safe transfer and back to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 1, this.erc721.address, 3);
        await this.registry.transferToAddress(accounts[0], this.erc721.address, 3, {from: accounts[1]});
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 1);
        assert.equal(children[1].length, 1);
        assert.equal(children[0][0], this.erc721.address);
        assert.equal(children[1][0], 2);
    });
});

function safeTransferFrom(from, registryAddress, toErc721, toTokenId, whichErc721, whichTokenId) {
    const to = formatToByteArray(toErc721, toTokenId);
    return safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId);
}

function safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId) {
    const safeTransferFromFunc = SampleERC721.abi.find(f => f.name === 'safeTransferFrom' && f.inputs.length === 4);
    const transferMethodTransactionData = web3Abi.encodeFunctionCall(
        safeTransferFromFunc, [from, registryAddress, whichTokenId, to]
    );
    const txHash = web3.eth.sendTransaction({
        from, to: whichErc721, data: transferMethodTransactionData, value: 0, gas: 500000
    });
    return web3.eth.getTransactionReceipt(txHash);
}

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

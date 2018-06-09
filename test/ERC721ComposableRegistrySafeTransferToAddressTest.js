const web3Abi = require('web3-eth-abi');

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("I can safe transfer to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.safeTransferToAddress(accounts[1], this.erc721.address, 2);
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("He cannot safe transfer my tokens to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        try {
            await this.registry.safeTransferToAddress(accounts[1], this.erc721.address, 2, {from: accounts[1]});
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("He can safe transfer approved tokens to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.approve(accounts[1], this.erc721.address, 2);
        await this.registry.safeTransferToAddress(accounts[1], this.erc721.address, 2, {from: accounts[1]});
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });

    it("Token has no children after safe transfer", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        await this.registry.safeTransferToAddress(accounts[1], this.erc721.address, 2);
        const children = await this.registry.children(this.erc721.address, 1);
        assert.equal(children[0].length, 0);
        assert.equal(children[1].length, 0);
    });

    it("Event is emitted after safe transfer", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.safeTransferToAddress(accounts[1], this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.to, accounts[1]);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("I can safe transfer to address with data", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        safeTransferToAddressWithData(accounts[0], this.registry.address, accounts[1], this.erc721.address, 2, '0xdeadbeef');
        const owner = await this.registry.ownerOf(this.erc721.address, 2);
        assert.equal(owner, accounts[1]);
    });
});

function safeTransferToAddressWithData(from, registryAddress, to, whichErc721, whichTokenId, data) {
    const safeTransferToAddressFunc = ERC721ComposableRegistry.abi.find(f => f.name === 'safeTransferToAddress' && f.inputs.length === 4);
    const transferMethodTransactionData = web3Abi.encodeFunctionCall(
        safeTransferToAddressFunc, [to, whichErc721, whichTokenId, data]
    );
    const txHash = web3.eth.sendTransaction({
        from, to: registryAddress, data: transferMethodTransactionData, value: 0, gas: 500000
    });
    return web3.eth.getTransactionReceipt(txHash);
}

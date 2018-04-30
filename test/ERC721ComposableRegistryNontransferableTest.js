const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");
const SampleNontransferableERC721 = artifacts.require("SampleNontransferableERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("Cannot transfer nontransferable token", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        const nontransferable721 = await SampleNontransferableERC721.deployed();
        const to = '0x' + erc721.address.substring(2).padStart(64, '0') + '1'.padStart(64, '0');
        await nontransferable721.create(registry.address, to);
        try {
            await registry.transfer(erc721.address, 2, nontransferable721.address, 1);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

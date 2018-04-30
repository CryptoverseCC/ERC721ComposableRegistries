const ERC721FungiblesRegistry = artifacts.require("ERC721FungiblesRegistry.sol");
const SampleERC20 = artifacts.require("SampleERC20.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token's balance is increased after safe transfer", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        const to = formatToByteArray(erc721.address, 1);
        await erc20.transferAndCall(registry.address, 50, to);
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 50);
    });
});

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

const ERC721FungiblesRegistry = artifacts.require("ERC721FungiblesRegistry.sol");
const SampleERC20 = artifacts.require("SampleERC20.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token has zero balance", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 0);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token has non-zero balance", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        await erc20.mint(accounts[0], 100);
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 50);
    });
});

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleCryptoKitties = artifacts.require("SampleCryptoKitties.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    it("I can transfer CryptoKitty", async () => {
        const registry = await ERC721ComposableRegistry.deployed();
        const erc721 = await SampleCryptoKitties.deployed();
        await erc721.createPromoKitty(6, accounts[0]);
        await erc721.createPromoKitty(28, accounts[0]);
        await erc721.createPromoKitty(496, accounts[0]);
        await erc721.approve(registry.address, 2);
        await registry.transfer(erc721.address, 1, erc721.address, 2);
        await registry.transfer(erc721.address, 3, erc721.address, 2);
        await registry.transferToAddress(accounts[0], erc721.address, 2);
    });
});

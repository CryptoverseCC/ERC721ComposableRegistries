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
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 50);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token's balance is increased", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 20);
        await registry.transfer(erc721.address, 1, erc20.address, 20);
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 40);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My other token's balance stays zero", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        const balance = await registry.balanceOf(erc721.address, 2, erc20.address);
        assert.equal(balance, 0);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token can transfer to other token", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        await registry.transferFrom(erc721.address, 1, erc721.address, 2, erc20.address, 20);
        const balance = await registry.balanceOf(erc721.address, 2, erc20.address);
        assert.equal(balance, 20);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token's balance is decreased", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        await registry.transferFrom(erc721.address, 1, erc721.address, 2, erc20.address, 20);
        const balance = await registry.balanceOf(erc721.address, 1, erc20.address);
        assert.equal(balance, 30);
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("My token cannot transfer more than it owns", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create();
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        try {
            await registry.transferFrom(erc721.address, 1, erc721.address, 2, erc20.address, 51);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

contract('ERC721FungiblesRegistry', (accounts) => {

    it("I cannot transfer from his token", async () => {
        const registry = await ERC721FungiblesRegistry.deployed();
        const erc20 = await SampleERC20.deployed();
        const erc721 = await SampleERC721.deployed();
        await erc721.create({from: accounts[1]});
        await erc721.create();
        await registry.transfer(erc721.address, 1, erc20.address, 50);
        try {
            await registry.transferFrom(erc721.address, 1, erc721.address, 2, erc20.address, 20);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });
});

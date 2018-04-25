
const SampleERC721 = artifacts.require("SampleERC721.sol");
const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");

contract('ERC721ComposableRegistry', (accounts) => {

	it("I'm owner of my token", async () => {
		const erc721 = await SampleERC721.deployed();
		await erc721.create();
		const instance = await ERC721ComposableRegistry.deployed();
		const owner = await instance.ownerOf(erc721.address, 1);
		assert.equal(owner, accounts[0]);
	});
});

contract('ERC721ComposableRegistry', (accounts) => {

	it("He's owner of his token", async () => {
		const erc721 = await SampleERC721.deployed();
		await erc721.create({from: accounts[1]});
		const instance = await ERC721ComposableRegistry.deployed();
		const owner = await instance.ownerOf(erc721.address, 1);
		assert.equal(owner, accounts[1]);
	});
});

contract('ERC721ComposableRegistry', (accounts) => {

	it("He's owner of token owned by his token", async () => {
		const erc721 = await SampleERC721.deployed();
		await erc721.create({from: accounts[1]});
		await erc721.create();
		const instance = await ERC721ComposableRegistry.deployed();
		await instance.transfer(erc721.address, 1, erc721.address, 2);
		const owner = await instance.ownerOf(erc721.address, 2);
		assert.equal(owner, accounts[1]);
	});
});

contract('ERC721ComposableRegistry', (accounts) => {

	it("I cannot transfer his token", async () => {
		const erc721 = await SampleERC721.deployed();
		await erc721.create({from: accounts[1]});
		await erc721.create();
		const instance = await ERC721ComposableRegistry.deployed();
		try {
    		await instance.transfer(erc721.address, 2, erc721.address, 1);
		    assert.fail();
		} catch (ignore) {
		}
	});
});

contract('ERC721ComposableRegistry', (accounts) => {

	it("I cannot transfer to non-existing token", async () => {
		const erc721 = await SampleERC721.deployed();
		await erc721.create();
		const instance = await ERC721ComposableRegistry.deployed();
		try {
		    await instance.transfer(erc721.address, 6, erc721.address, 1);
		    assert.fail();
		} catch (ignore) {
		}
	});
});

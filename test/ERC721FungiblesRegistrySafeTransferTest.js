const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const ERC721FungiblesRegistry = artifacts.require("ERC721FungiblesRegistry.sol");
const SampleERC20 = artifacts.require("SampleERC20.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721FungiblesRegistry', (accounts) => {

    beforeEach(async () => {
        this.composableRegistry = await ERC721ComposableRegistry.new();
        this.registry = await ERC721FungiblesRegistry.new(this.composableRegistry.address);
        this.erc20 = await SampleERC20.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
    });

    it("My token's balance is increased after safe transfer", async () => {
        const to = formatToByteArray(this.erc721.address, 1);
        await this.erc20.transferAndCall(this.registry.address, 50, to);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 50);
    });

    it("Cannot transfer to non-existing token", async () => {
        const to = formatToByteArray(this.erc721.address, 6);
        try {
            await this.erc20.transferAndCall(this.registry.address, 50, to);
            assert.fail();
        } catch (ignore) {
            if (ignore.name === 'AssertionError') throw ignore;
        }
    });

    it("My token's balance is increased after approveAndCall", async () => {
        const to = formatToByteArray(this.erc721.address, 1);
        await this.erc20.approveAndCall(this.registry.address, 50, to);
        const balance = await this.registry.balanceOf(this.erc721.address, 1, this.erc20.address);
        assert.equal(balance, 50);
    });
});

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

const web3Abi = require('web3-eth-abi');

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

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

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

function addressAtIndex(data, index) {
    return '0x' + data.substring(2 + 64 * index + 24, 2 + 64 * (index + 1));
}

function intAtIndex(data, index) {
    return parseInt(data.substring(2 + 64 * index, 2 + 64 * (index + 1)), 16);
}

module.exports.safeTransferFrom = safeTransferFrom;
module.exports.safeTransferFromImpl = safeTransferFromImpl;
module.exports.safeTransferToAddressWithData = safeTransferToAddressWithData;
module.exports.formatToByteArray = formatToByteArray;
module.exports.addressAtIndex = addressAtIndex;
module.exports.intAtIndex = intAtIndex;

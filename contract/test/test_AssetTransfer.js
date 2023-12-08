const AssetTransfer = artifacts.require('../contracts/AssetTransfer.sol');
const truffleAssert = require('truffle-assertions');
const web3 = require('web3');

contract('AssetTransfer', (accounts) => {

    // return codes
    const codes = {
        success: '0x01',
        onlyAdminError: 'Access Denied',
        isRegisteredError: 'Client must be registered',
        startTransferError: 'Transfer already active',
        sendTransferError: 'Transfer does not exist',
        confirmTransferError: 'Transfer must be complete to confirm'
    };

    let AssetTransferTest;

    it('Setup contract before tests', async () => {
        AssetTransferTest = await AssetTransfer.new();
    });

    describe('Modifier Tests', () => {
        it('onlyAdmin modifier should only let the admin register clients', async () => {
            await truffleAssert.reverts(
                AssetTransferTest.registerClient(accounts[1], { from: accounts[1] }),
                truffleAssert.ErrorType.REVERT,
                codes.onlyAdminError,
                codes.onlyAdminError
            );
        });
        it('isRegistered modifier should only let registered clients perform transfer operations', async () => {
            const assetCost = 5;
            const transferAddress = "1234";

            await truffleAssert.reverts(
                AssetTransferTest.startTransfer(assetCost, transferAddress, { from: accounts[4] }),
                truffleAssert.ErrorType.REVERT,
                codes.isRegisteredError,
                codes.isRegisteredError
            );
        });
    })

    describe('Transfer Tests', () => {
        it('Setup contract for transfer tests', async () => {
            await AssetTransferTest.registerClient(accounts[1], { from: accounts[0] });
            await AssetTransferTest.registerClient(accounts[2], { from: accounts[0] });
        });

        it('Start transfer', async () => {
            const assetCost = 5;
            const transferAddress = "1234";

            await AssetTransferTest.startTransfer(assetCost, transferAddress, { from: accounts[2] });
        });

        it('Start duplicate transfer', async () => {
            const assetCost = 5;
            const transferAddress = "1234";

            await truffleAssert.reverts(
                AssetTransferTest.startTransfer(assetCost, transferAddress, { from: accounts[2] }),
                truffleAssert.ErrorType.REVERT,
                codes.startTransferError,
                codes.startTransferError
            );
        })

        it('Send invalid transfer', async () => {
            const transferAddress = "12345";

            await truffleAssert.reverts(
                AssetTransferTest.sendTransfer(transferAddress, { from: accounts[1], value: 4 }),
                truffleAssert.ErrorType.REVERT,
                codes.sendTransferError,
                codes.sendTransferError
            );
        });

        it('Confirm transfer early', async () => {
            const transferAddress = "1234";

            await truffleAssert.reverts(
                AssetTransferTest.confirmTransfer(transferAddress, { from: accounts[2] }),
                truffleAssert.ErrorType.REVERT,
                codes.confirmTransferError,
                codes.confirmTransferError
            );
        })

        it('Send transfer', async () => {
            const transferAddress = "1234";

            await AssetTransferTest.sendTransfer(transferAddress, { from: accounts[1], value: 5 });
        });

        it('Confirm transfer', async () => {
            const transferAddress = "1234";

            await AssetTransferTest.confirmTransfer(transferAddress, { from: accounts[2] });
        });
    })
});
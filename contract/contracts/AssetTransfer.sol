// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

contract AssetTransfer {
    struct transferInfo {
        uint assetCost;
        bytes assetInfo;
        bool complete;
        bool active;
    }
    mapping(bytes => transferInfo) private activeTransfers;
    mapping(address => bool) private registeredClients;
    address private admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access Denied");
        _;
    }
    modifier isRegistered() {
        require(registeredClients[msg.sender] == true, "Client must be registered");
        _;
    }

    constructor() {
        admin = msg.sender;
    }
    function registerClient(address client) public onlyAdmin {
        registeredClients[client] = true;
    }
    function compareBytes(bytes memory a, bytes memory b) internal pure returns (bool) {
        require(a.length == b.length);

        for(uint i = 0; i < a.length; i++) {
            if(a[i] != b[i]) {
                return false;
            }
        }
        
        return true;
    }
    // the receiving client will start the transfer
    function startTransfer(bytes memory assetInfo, uint assetCost, bytes memory transferAddress) public isRegistered {
        require(!activeTransfers[transferAddress].active, "Transfer already active");

        activeTransfers[transferAddress] = transferInfo(assetCost, assetInfo, false, true);
    }
    // once the transfer has been started the sending client can send the payment for the asset and information about the asset
    function sendTransfer(bytes memory assetInfo, bytes memory transferAddress) public payable isRegistered {
        transferInfo memory transfer = activeTransfers[transferAddress];

        require(transfer.assetCost == msg.value &&
                compareBytes(transfer.assetInfo, assetInfo) &&
                transfer.complete == false, "Transfer does not exist");

        transfer.complete = true;
        activeTransfers[transferAddress] = transfer;
    }
    // if the correct asset and payment were sent by the sending client then the transfer can be closed by the receiving client
    function confirmTransfer(bytes memory transferAddress) public payable isRegistered {
        transferInfo memory transfer = activeTransfers[transferAddress];

        require(transfer.complete == true, "Transfer must be complete to confirm");

        payable(msg.sender).transfer(transfer.assetCost);
        delete activeTransfers[transferAddress];
    }
}
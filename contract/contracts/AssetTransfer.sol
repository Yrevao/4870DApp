// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

contract AssetTransfer {
    struct transferInfo {
        address receiverAddr;
        uint assetCost;
        bool complete;
        bool active;
    }
    mapping(string => transferInfo) private activeTransfers;
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
    // the receiving client will start the transfer
    function startTransfer(uint assetCost, string memory transferAddress) public isRegistered {
        require(!activeTransfers[transferAddress].active, "Transfer already active");

        activeTransfers[transferAddress] = transferInfo(msg.sender, assetCost, false, true);
    }
    // once the transfer has been started the sending client can send the payment for the asset and information about the asset
    function sendTransfer(string memory transferAddress) public payable isRegistered {
        transferInfo memory transfer = activeTransfers[transferAddress];

        require(transfer.assetCost == msg.value &&
                transfer.complete == false, "Asset send failed");

        transfer.complete = true;
        activeTransfers[transferAddress] = transfer;
    }
    // if the correct asset and payment were sent by the sending client then the transfer can be closed by the receiving client
    function confirmTransfer(string memory transferAddress) public payable isRegistered {
        transferInfo memory transfer = activeTransfers[transferAddress];

        require(transfer.receiverAddr == msg.sender && transfer.complete == true, "Transfer confirmation failed");

        payable(msg.sender).transfer(transfer.assetCost);
        delete activeTransfers[transferAddress];
    }
}
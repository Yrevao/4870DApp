require('dotenv').config();
const crypto = require('crypto');
const { Web3 } = require('web3');
const s_site = require('../schemas/s_site');

const web3 = new Web3(process.env.PROVIDER);
const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "client",
          "type": "address"
        }
      ],
      "name": "registerClient",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "assetInfo",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "assetCost",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "transferAddress",
          "type": "bytes"
        }
      ],
      "name": "startTransfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "assetInfo",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "transferAddress",
          "type": "bytes"
        }
      ],
      "name": "sendTransfer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "transferAddress",
          "type": "bytes"
        }
      ],
      "name": "confirmTransfer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    }
];
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACTADDRESS);

module.exports = {
  register: async (address) => {
    const accounts = await web3.eth.getAccounts();

    const clientAddress = web3.utils.toChecksumAddress(address);
    
    await contract.methods.registerClient(clientAddress).send({from: accounts[0]});
  },
  receive: async (assetName, callingId) => {
    // verify arguments with mongoDB
    const site = s_site.findById(callingId);
    const asset = site.assets.find((anAsset) => anAsset.name == assetName);

    const transferAddress = crypto.createHash('sha1').update(asset.name + asset.price).digest('hex');

    // format arguments
    const hexAsset = web3.utils.utf8ToHex(asset.name);
    const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);
    const clientAddress = web3.utils.toChecksumAddress(site.address);

    await contract.methods.startTransfer(hexAsset, asset.price, hexTransferAddress).send({from: clientAddress});

    return transferAddress;
  }
}
require('dotenv').config();
const crypto = require('crypto');
const { Web3 } = require('web3');
const s_site = require('../schemas/s_site');
const s_transfer = require('../schemas/s_transfer');

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
  receive: async (assetName, assetPrice, callingId) => {
    // request site details from mongo
    const site = await s_site.findById(callingId);
    // generate transfer address from the asset name and price
    const transferAddress = crypto.createHash('sha1').update(assetName + assetPrice).digest('hex');

    // format arguments
    const hexAsset = web3.utils.utf8ToHex(assetName);
    const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);
    const clientAddress = web3.utils.toChecksumAddress(site.address);

    await contract.methods.startTransfer(hexAsset, assetPrice, hexTransferAddress).send({from: clientAddress});

    return transferAddress;
  },
  send: async (assetName, transferAddress, callingId) => {
    // request site details from s_site
    let site = await s_site.findById(callingId);
    // delete asset from site object
    let asset;
    site.assets.forEach((anAsset, i) => {
      if(anAsset.name == assetName) {
        asset = anAsset;
        delete site.assets[i];
        return true;
      }
      return false;
    });

    // format arguments
    const hexAsset = web3.utils.utf8ToHex(asset.name);
    const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);
    const clientAddress = web3.utils.toChecksumAddress(site.address);
    
    // contract call
    await contract.methods.sendTransfer(hexAsset, hexTransferAddress).send({from: clientAddress, value: asset.price});

    // update s_site with new assets list
    await s_site.findOneAndReplace({ _id: new ObjectId(callingId) }, site);
    // add asset to s_transfer
    await s_transfer.insertMany([{
      transferAddress: transferAddress,
      name: asset.name,
      price: asset.price
    }]);
  },
  confirm: async (transferAddress, callingId) => {
    // request site details from mongo
    const site = await s_site.findById(callingId);
    const transfer = await s_transfer.findOne({ transferAddress: transferAddress });

    // format arguments
    const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);
    const clientAddress = web3.utils.toChecksumAddress(site.address);

    // contract call
    await contract.methods.confirmTransfer(hexTransferAddress).send({from: clientAddress});

    // add asset to site object
    site.assets.push({
      name: transfer.name,
      price: transfer.price
    });
    // update s_site with new assets list
    await s_site.findOneAndReplace({ _id: new ObjectId(callingId) }, site);
  }
}
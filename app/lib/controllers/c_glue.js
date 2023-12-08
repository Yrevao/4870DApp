require('dotenv').config();
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
        "internalType": "uint256",
        "name": "assetCost",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "transferAddress",
        "type": "string"
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
        "internalType": "string",
        "name": "transferAddress",
        "type": "string"
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
        "internalType": "string",
        "name": "transferAddress",
        "type": "string"
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
const gasLimit = 200000;

module.exports = {
  register: async (address) => {
    const accounts = await web3.eth.getAccounts();

    const clientAddress = web3.utils.toChecksumAddress(address);
    
    await contract.methods.registerClient(clientAddress).send({from: accounts[0], gas: gasLimit});
  },
  receive: async (args) => {
    // split up the args object
    const assetName = args.assetName;
    const assetPrice = args.assetPrice;
    const callingId = args.callingId;
  
    // request site details from mongo
    const site = await s_site.findById(callingId);

    // verify asset do nothing if asset dosen't exist / is already owned
    const assetIndex = site.assets.findIndex((anAsset) => (
      anAsset.owned == false &&
      anAsset.name == assetName &&
      anAsset.price == assetPrice
    ));
    if(assetIndex < 0)
      return false;

    // generate random transfer address
    const transferAddress = web3.utils.randomHex(32);

    // format arguments
    const clientAddress = web3.utils.toChecksumAddress(site.address);
    await contract.methods.startTransfer(web3.utils.toWei(assetPrice, "ether"), transferAddress).send({from: clientAddress, gas: gasLimit});

    // add asset to s_transfer
    await s_transfer.insertMany([{
      receiverId: callingId,
      transferAddress: transferAddress,
      name: assetName,
      price: assetPrice
    }]);
  },
  send: async (args) => {
    // split up the args object
    const assetName = args.assetName;
    const assetPrice = args.assetPrice;
    const transferAddress = args.transferAddress;
    const callingId = args.callingId;

    // request transfer/site details from mongo
    let site = await s_site.findById(callingId);
    const transfer = await s_transfer.findOne({transferAddress: transferAddress});
    
    // verify transfer
    if(transfer.name != assetName || transfer.price != assetPrice)
      return false;

    // find asset in site object
    const assetIndex = site.assets.findIndex((anAsset, i) => (
      anAsset.owned == true && 
      anAsset.name == assetName && 
      anAsset.price == assetPrice
    ));

    // don't do anything if the asset isn't owned/found
    if(assetIndex < 0)
      return false;

    // remove ownership from asset in site object
    site.assets[assetIndex].owned = false;
    let asset = site.assets[assetIndex];

    // format arguments
    const clientAddress = web3.utils.toChecksumAddress(site.address);
    
    // contract call
    await contract.methods.sendTransfer(transferAddress).send({from: clientAddress, value: web3.utils.toWei(asset.price, 'ether'), gas: gasLimit});

    // update mongo with assets
    await s_site.findByIdAndUpdate(callingId, site);
  },
  confirm: async (args) => {
    // split up the args object
    const transferAddress = args.transferAddress;
    const callingId = args.callingId;

    // request site details from mongo
    const site = await s_site.findById(callingId);

    // format arguments
    const clientAddress = web3.utils.toChecksumAddress(site.address);

    // contract call
    await contract.methods.confirmTransfer(transferAddress).send({from: clientAddress, gas: gasLimit});

    // verify transfer
    const transfer = await s_transfer.findOne({ transferAddress: transferAddress });
    if(transfer.receiverId != callingId)
      return false;

    // own asset in site object
    const assetIndex = site.assets.findIndex((anAsset) => (
      anAsset.owned == false &&
      anAsset.name == transfer.name && 
      anAsset.price == transfer.price
    ));
    // don't do anything if asset isn't found
    if(assetIndex < 0)
      return false;

    site.assets[assetIndex].owned = true;

    // update s_site with new assets list
    await s_site.findByIdAndUpdate(callingId, site);
  }
}
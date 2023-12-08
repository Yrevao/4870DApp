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

// sign transaction then send
const sendSignedTransaction = async (data, from, value) => {
  // build transaction object
  const rawTx =
  {
    from: from,
    to: process.env.CONTRACTADDRESS,
    gas: 4000000,
    gasPrice: 10000000000,
    value: value,
    data: data
  };

  // get private keys dict
  const privateKeys = JSON.parse(process.env.ADDRESSTOPRIVATEKEY);
  // convert private key to bytes
  const bytesPrivateKey = Buffer.from(privateKeys[`${from}`], 'hex');

  // sign transaction then send transaction
  web3.eth.accounts.signTransaction(rawTx, bytesPrivateKey).then((signedTx) => {    
    web3.eth.sendSignedTransaction(signedTx.rawTransaction).then((receipt) => {
      if(!receipt.status)
        throw "Transaction Call Reverted"
    });
  });
}

module.exports = {
  register: async (address) => {
    const client = web3.utils.toChecksumAddress(address);
    
    await sendSignedTransaction(
      contract.methods.registerClient(client).encodeABI(),
      process.env.ADMIN,
      0
    );
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

    await sendSignedTransaction(
      contract.methods.startTransfer(assetPrice, transferAddress).encodeABI(),
      site.address,
      0
    );

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
    
    // contract call
    await sendSignedTransaction(
      contract.methods.sendTransfer(transferAddress).encodeABI(),
      site.address, 
      asset.price
    );

    // update mongo with assets
    await s_site.findByIdAndUpdate(callingId, site);
  },
  confirm: async (args) => {
    // split up the args object
    const transferAddress = args.transferAddress;
    const callingId = args.callingId;

    // request site details from mongo
    const site = await s_site.findById(callingId);

    // contract call
    await sendSignedTransaction(
      contract.methods.confirmTransfer(transferAddress).encodeABI(),
      site.address,
      0
    );

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
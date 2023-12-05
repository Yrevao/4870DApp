const enableButton = document.getElementById('enable');
const registerButton = document.getElementById('register');
const receiveButton = document.getElementById('receive');
const sendButton = document.getElementById('send');
const confirmButton = document.getElementById('confirm');
const contractAddress = '0x18efB6FBf3c3D7e868dE80eD94ee802fC501F210';
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
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
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
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  }
];

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);

enableButton.onclick = async () => {
  if(typeof window.ethereum !== 'undefined') {
    await ethereum.request({ method: 'eth_requestAccounts' });
  }
  else {
    alert("Metamask not available");
  }
}

registerButton.onclick = async () => {
  const accounts = await web3.eth.getAccounts();

  clientAddress = web3.utils.toChecksumAddress(document.getElementById('address').value);

  await contract.methods.registerClient(clientAddress).send({from: accounts[0]});
}

receiveButton.onclick = async () => {
  const accounts = await web3.eth.getAccounts();

  const asset = document.getElementById('assets').value;
  const assetCost = 5000000000000000000;
  const transferAddress = Math.floor(Math.random() * 1000000).toString();

  document.getElementById('address').value = transferAddress;

  const hexAsset = web3.utils.utf8ToHex(asset);
  const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);

  await contract.methods.startTransfer(hexAsset, assetCost, hexTransferAddress).send({from: accounts[0]});
}

sendButton.onclick = async () => {
  const accounts = await web3.eth.getAccounts();

  const asset = document.getElementById('assets').value;
  const assetCost = 5000000000000000000;
  const transferAddress = document.getElementById('address').value;

  const hexAsset = web3.utils.utf8ToHex(asset);
  const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);

  await contract.methods.sendTransfer(hexAsset, hexTransferAddress).send({from: accounts[0], value: assetCost});
}

confirmButton.onclick = async () => {
  const accounts = await web3.eth.getAccounts();

  const transferAddress = document.getElementById('address').value;

  const hexTransferAddress = web3.utils.utf8ToHex(transferAddress);
  
  await contract.methods.confirmTransfer(hexTransferAddress).send({from: accounts[0]});
}
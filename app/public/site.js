const receiveButton = document.getElementById('receive');
const sendButton = document.getElementById('send');
const confirmButton = document.getElementById('confirm');
const address = document.getElementById('address');
const assetDD = document.getElementById('assets');
const url = new URL(window.location);
const callingId = url.searchParams.get('id');

receiveButton.onclick = () => {
  // construct args object for glue code
  const asset = JSON.parse(assetDD.value);
  const args = `{
    "assetName": "${asset.name}",
    "assetPrice": ${asset.price},
    "callingId": "${callingId}"
  }`;
  const query = `/update?args=${args}&op=receive`;

  // sent post request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', window.location.origin + query, false);
  xhr.send();
  
  window.location.reload();
}

sendButton.onclick = () => {
  // construct args object for glue code
  const asset = JSON.parse(assetDD.value);
  const args = `{
    "assetName": "${asset.name}",
    "assetPrice": ${asset.price},
    "transferAddress": "${address.value}",
    "callingId": "${callingId}"
  }`;
  const query = `/update?args=${args}&op=send`;

  // sent post request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', window.location.origin + query, false);
  xhr.send();

  window.location.reload();
}

confirmButton.onclick = () => {
  // construct args object for glue code
  const args = `{
    "transferAddress": "${address.value}",
    "callingId": "${callingId}"
  }`;
  const query = `/update?args=${args}&op=confirm`;

  // sent post request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', window.location.origin + query, false);
  xhr.send();

  window.location.reload();
}
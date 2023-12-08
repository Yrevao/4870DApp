// elements
const receiveButton = document.getElementById('receive');
const sendButton = document.getElementById('send');
const confirmButton = document.getElementById('confirm');
const address = document.getElementById('address');

// url
const url = new URL(window.location);
const callingId = url.searchParams.get('id');

// asset selection tracking
let selectedOwned = null;
let selectedAvailable = null;

// toggle which button is selected in the asset menus
const toggleButtons = (buttonClass, buttonIndex, asset) => {
  if(buttonClass == 'owned')
    selectedOwned = asset;
  else
    selectedAvailable = asset;

  updateQuery(buttonClass, buttonIndex);

  let buttons = document.querySelectorAll(`.${buttonClass}-button`);
  buttons.forEach((button, i) => {
      if (i == buttonIndex)
          button.classList.add('active');
      else
          button.classList.remove('active');
  });
}

const updateQuery = (name, value) => {
  url.searchParams.set(name, value);

  window.history.pushState(null, '', url.toString());
}

receiveButton.onclick = () => {
  // construct args object for glue code
  const asset = selectedAvailable;
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
  const asset = selectedOwned;
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

window.onload = () => {
  const ownedId = url.searchParams.get('owned');
  const availableId = url.searchParams.get('available');

  if(ownedId != null) {
    let buttons = document.querySelectorAll(`.owned-button`);
    buttons[ownedId].click();
  }
  if(availableId != null) {
    let buttons = document.querySelectorAll(`.available-button`);
    buttons[availableId].click();
  }
}
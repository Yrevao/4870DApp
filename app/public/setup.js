const sitesDD = document.getElementById('sites');
const assetsDD = document.getElementById('assets');
const addSiteButton = document.getElementById('addSite');
const addAssetButton = document.getElementById('addAsset');
const ownedCheckbox = document.getElementById('owned');
const siteNameTextarea = document.getElementById('siteName');
const siteAddressTextarea = document.getElementById('siteAddress');
const assetNameTextarea = document.getElementById('assetName');
const assetPriceTextarea = document.getElementById('assetPrice');
const doneButton = document.getElementById('done');
const url = new URL(window.location);
let sites = [];

// object schemas
const assetFactory = () => {
    newAsset = {
        name: '',
        price: -1,
        owned: false
    }

    return newAsset;
}

const siteFactory = () => {
    newSite = {
        assets: [],
        name: '',
        address: ''
    }

    return newSite;
}

// button events
addAssetButton.onclick = () => {
    // add asset to current site's assets array
    sites[ sitesDD.options[ sitesDD.selectedIndex ].value ].assets.push(assetFactory());

    // update assets dropdown and details
    updateAssetsDD(assetsDD.selectedIndex);
    assetsDD.selectedIndex = assetsDD.options.length - 1;
    updateAssetDetails();
}

ownedCheckbox.onchange = () => {
    sites[ sitesDD.selectedIndex ].assets[ assetsDD.selectedIndex ].owned = ownedCheckbox.checked;

    updateAssetsDD(assetsDD.selectedIndex);

    updateQuery();
}

addSiteButton.onclick = () => {
    // initialize new site
    let newSite = siteFactory();
    newSite.assets.push(assetFactory());

    // add site to array
    sites.push(newSite);

    // update sites dropdown and select new site
    updateSitesDD(sitesDD.selectedIndex);
    sitesDD.selectedIndex = sitesDD.options.length - 1;
    updateSiteDetails();

    // after selecting the new site display site assets
    updateAssetsDD(assetsDD.selectedIndex);
    updateAssetDetails();
}

// textarea events
assetNameTextarea.onchange = () => {
    sites[ sitesDD.selectedIndex ].assets[ assetsDD.selectedIndex ].name = assetNameTextarea.value;

    updateAssetsDD(assetsDD.selectedIndex);

    updateQuery();
}

assetPriceTextarea.onchange = () => {
    sites[ sitesDD.selectedIndex ].assets[ assetsDD.selectedIndex ].price = assetPriceTextarea.value;

    updateQuery();
}

siteNameTextarea.onchange = () => {
    sites[ sitesDD.selectedIndex ].name = siteNameTextarea.value;

    updateSitesDD(sitesDD.selectedIndex);

    updateQuery();
}

siteAddressTextarea.onchange = () => {
    sites[ sitesDD.selectedIndex ].address = siteAddressTextarea.value;

    updateQuery();
}

// dropdown events
sitesDD.onchange = () => {
    updateSiteDetails();

    updateAssetsDD(assetsDD.selectedIndex);
    updateAssetDetails();

    updateQuery();
}

assetsDD.onchange = () => {
    updateAssetDetails();

    updateQuery();
}

// set the asset details to the currently selected asset option
const updateAssetDetails = () => {
    // get selected site object
    curSite = sites[sitesDD.selectedIndex];
    // get currently selected asset object based on current site object
    curAsset = curSite.assets[assetsDD.selectedIndex];

    // update site details based on object
    assetNameTextarea.value = curAsset.name;
    assetPriceTextarea.value = curAsset.price;
    ownedCheckbox.checked = curAsset.owned;
}

// set the site details to the current site selection
const updateSiteDetails = () => {
    // get selected site object
    curSite = sites[sitesDD.selectedIndex];

    // update name and address based on site object
    siteNameTextarea.value = curSite.name;
    siteAddressTextarea.value = curSite.address;
}

// update the asset dropdown to contain the assets of the current site selection
const updateAssetsDD = (currentSelection) => {
    // clear assets dd
    while(assetsDD.firstChild) {
        assetsDD.removeChild(assetsDD.firstChild);
    }

    // get selected site object
    curSite = sites[sitesDD.selectedIndex];

    // populate assets dropdown with assets from current site
    curSite.assets.forEach((asset, i) => {
        let assetOpt = document.createElement('option');

        assetOpt.value = i;

        const assetNameText = asset.name == '' ? 'Untitled Asset' : asset.name;
        assetOpt.text = `${assetNameText} [Owned: ${asset.owned}]`;

        assetsDD.appendChild(assetOpt);
    });

    // restore selected index
    assetsDD.selectedIndex = currentSelection;
}

// update site dropdown to contain all the indexes of the sites array
const updateSitesDD = (currentSelection) => {
    // clear sites dropdown
    while(sitesDD.firstChild) {
        sitesDD.removeChild(sitesDD.firstChild);
    }

    // populate sites dropdown with the current sites array
    sites.forEach((site, i) => {
        siteOpt = document.createElement('option');

        siteOpt.value = i;
        siteOpt.text = site.name == '' ? 'Untitled Website' : site.name;

        sitesDD.appendChild(siteOpt);
    });

    // restore selected index after table wipe
    sitesDD.selectedIndex = currentSelection;
}

const updateQuery = () => {
    url.searchParams.set('sites', JSON.stringify(sites));

    window.history.pushState(null, '', url.toString());
}

// get sites from the url query string or set default sites
window.onload = () => {
    if(url.searchParams.toString() != '') {
        // set sites from query string
        sites = JSON.parse(url.searchParams.get('sites'));
    }
    else {
        // setup default sites
        siteA = siteFactory();
        siteB = siteFactory();

        siteA.name = 'Site A';
        siteB.name = 'Site B';

        siteA.address = '0x2aDd3E283aC08E931C4AD35A3bdd36D799FF8574';
        siteB.address = '0x305273C1c3e79b01E861F143a5dC6Aab97AA7596';

        // setup default assets
        assetA = assetFactory();
        assetB = assetFactory();

        assetA.name = "Asset A";
        assetB.name = "Asset B";

        assetA.price = 10;
        assetB.price = 25;

        siteA.assets = [assetA, assetB];
        siteB.assets = [structuredClone(assetA), structuredClone(assetB)];

        // initialize sites
        sites = [siteA, siteB]
    }
    
    updateSitesDD(0);
    updateAssetsDD(0);

    updateSiteDetails();
    updateAssetDetails();
    
    updateQuery();
}
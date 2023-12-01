const AssetTransfer = artifacts.require("AssetTransfer");

module.exports = function(deployer) {
  deployer.deploy(AssetTransfer);
};

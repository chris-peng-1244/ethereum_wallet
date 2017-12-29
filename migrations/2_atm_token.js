const ATMToken = artifacts.require("./ATMToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ATMToken);
};

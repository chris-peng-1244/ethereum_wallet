const Controller = artifacts.require("./Controller.sol");

module.exports = function(deployer) {
  deployer.deploy(Controller);
};

const EtherSplitter = artifacts.require("EtherSplitter");

module.exports = function (deployer) {
  deployer.deploy(
    EtherSplitter,
    process.env.RECIPIENT1_ADDRESS,
    process.env.RECIPIENT2_ADDRESS,
    process.env.RECIPIENT3_ADDRESS
  );
};
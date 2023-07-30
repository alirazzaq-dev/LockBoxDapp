import { deployments, ethers } from "hardhat"
import { network } from "hardhat";

const fs = require("fs")
const frontEndContractsFile = "./utils/contractAddresses.json"
const frontEndAbiFile = "./utils/abis.json"

module.exports = async () => {
    console.log("")
    console.log("Writing to front end...")
    await updateContractAddresses()
    await updateAbi()
    console.log("Front end written!")
}

async function updateAbi() {

    const LockBox = await deployments.getArtifact("LockBox");
    const TestERC1155 = await deployments.getArtifact("TestERC1155");
    const TestNFT = await deployments.getArtifact("TestNFT");
    const TestToken = await deployments.getArtifact("TestToken");

    let contractABIs = {
        LockBox: LockBox.abi,
        TestERC1155: TestERC1155.abi,
        TestNFT: TestNFT.abi,
        TestToken: TestToken.abi,
    }

    fs.writeFileSync(frontEndAbiFile, JSON.stringify(contractABIs));


}

async function updateContractAddresses() {

    const chainId = network.config.chainId;

    const LockBox = await deployments.get("LockBox");
    const TestERC1155 = await deployments.get("TestERC1155");
    const TestNFT = await deployments.get("TestNFT");
    const TestToken = await deployments.get("TestToken");

    let contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))

    contractAddresses[chainId] = {
        LockBox: LockBox.address,
        TestERC1155: TestERC1155.address,
        TestNFT: TestNFT.address,
        TestToken: TestToken.address,
        chainId: chainId
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))

}

module.exports.tags = ["all", "frontend"]
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { LockBox, LockBox__factory } from "../typechain-types";
import varify from "../utils/varify";
// import {verify} from "../utils/verify"


module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const [master] = await ethers.getSigners();
    const chainId = network.config.chainId;
    
    console.log("chainId: ", chainId);
    console.log("master: ", master.address);
    console.log("deployer: ", deployer);

    // Local
    if (chainId == 31337) {

        const TestERC1155 = await deploy("TestERC1155", {
            from: deployer,
            args: [],
            log: true,
        })

        const TestNFT = await deploy("TestNFT", {
            from: deployer,
            args: [],
            log: true,
        })

        const TestToken = await deploy("TestToken", {
            from: deployer,
            args: [],
            log: true,
        })

        const LockBox = await deploy("LockBox", {
            from: deployer,
            args: [],
            log: true,
        })

    }

    else {

        const TestERC1155 = await deploy("TestERC1155", {
            from: deployer,
            args: [],
            log: true,
        })

        const TestNFT = await deploy("TestNFT", {
            from: deployer,
            args: [],
            log: true,
        })

        const TestToken = await deploy("TestToken", {
            from: deployer,
            args: [],
            log: true,
        })

        const LockBox = await deploy("LockBox", {
            from: deployer,
            args: [],
            log: true,
        })

        await varify(TestERC1155.address, []);
        await varify(TestNFT.address, []);
        await varify(TestToken.address, []);
        await varify(LockBox.address, []);


    }

}
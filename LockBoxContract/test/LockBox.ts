const { expect } = require('chai');
// import { balance,  time } from '@openzeppelin/test-helpers';
const {
  balance, time,
  // BN,           // Big Number support
  // constants,    // Common constants, like the zero address and largest integers
  // expectEvent,  // Assertions for emitted events
  // expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

// const { ethers } = require('hardhat');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { Signer, Contract, ContractFactory, BigNumber } from "ethers";
import { LockBox, LockBox__factory, TestNFT, TestNFT__factory, TestToken, TestToken__factory } from "../typechain";
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
import { network } from "hardhat";

enum AssetType { NFT, TOKEN, COIN }


const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";


let lockBox: LockBox, testToken: TestToken, testToken2: TestToken, testNFT: TestNFT, testNFT2: TestNFT
let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress;

// let latestBlock = await ethers.provider.getBlock("latest")
// latestBlock.timestamp
// await network.provider.send("evm_increaseTime", [Number(time.duration.days(1))])
// await network.provider.send("evm_mine")


describe('LockBox Test Stack', () => {

  beforeEach(async () => {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

    const LockBox: LockBox__factory = await ethers.getContractFactory("LockBox")
    const TestToken: TestToken__factory = await ethers.getContractFactory('TestToken')
    const TestNFT: TestNFT__factory = await ethers.getContractFactory('TestNFT')

    lockBox = await LockBox.deploy()
    testToken = await TestToken.deploy()
    testToken2 = await TestToken.deploy()
    testNFT = await TestNFT.deploy()
    testNFT2 = await TestNFT.deploy()

  });

  describe("On lockBox Creation", async () => {

    it("Only boxOwner and partnet can lock, approve and claim their assets ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user3.address);
      await testNFT.connect(user3).approve(lockBox.address, 0)
      await expect(lockBox.connect(user3).lockAsset(1)).to.be.reverted;


      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 1)
      await lockBox.connect(user1).lockAsset(1);


      await lockBox.connect(user2).lockAsset(1, { value: ethers.utils.parseEther("1.0") });

      await expect(lockBox.connect(user3).approveAsset(1)).to.be.reverted;
      await lockBox.connect(user1).approveAsset(1);
      await lockBox.connect(user2).approveAsset(1);

      await expect(lockBox.connect(user3).claimAsset(1)).to.be.reverted;

      await expect(() =>
      lockBox.connect(user1).claimAsset(1)
      ).to.changeBalance(lockBox, `-${ethers.utils.parseEther("1")}`)

      await lockBox.connect(user2).claimAsset(1);

      const lockBoxID = await lockBox.counter();
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);

      expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);

      let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
      let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
      let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
      expect(user1_nft_balance).to.equal(0);
      expect(user2_nft_balance).to.equal(1);
      expect(constract_nft_balance).to.equal(0);


    })
 
    it("A user cannot create a lockbox by paying enough fee ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await expect(lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.099") }
      )).to.be.reverted;

    })

    it("A user cannot approve or claim without locking any asset", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      );

      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;


      // const lockBoxID = await lockBox.counter();
      // let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      // expect(lockBoxInfo.assetA.lockStatus).to.equal(0);

      // expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
      // expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
      // expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      // // expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

      // expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
      // // expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
      // expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      // expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      // // expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);

      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;
      
      // try{
      //   await lockBox.connect(user1).claimAsset(1);

      // } catch(e){
      //   console.log(e)
      // }


    })

  })

  describe("On cancelation", async () => {

    it("Onle boxOwner can cancel the lockBox", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await expect(lockBox.connect(user2).cancelLockBox(1)).to.be.reverted;

    })

    it("Cannot cancel the lockBox twice", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await lockBox.connect(user1).cancelLockBox(1);
      await expect(lockBox.connect(user1).cancelLockBox(1)).to.be.reverted;

    })

    it("cancelation without any user locking their asset, no one will able to lock, approve or claim their asset", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(0);

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(0);

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

    })

    it("cancelation with owner locked his asset, owner can claim his asset only once, later nobody can lock, approve or claim his asset", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);

      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await lockBox.connect(user1).claimAsset(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(0)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(1)

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;

    })

    it("cancelation with other user locked his asset, user can claim his asset only once, later nobody can lock, approve or claim his asset", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

      await lockBox.connect(user2).claimAsset(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;


    })

    it("cancelation after both users locked their assets, later nobody can approve but everyone can claim his asset only once", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })

      // expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      // expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await lockBox.connect(user1).claimAsset(1);
      await lockBox.connect(user2).claimAsset(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(0)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(1)

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;

    })

    it("cancelation after owner approved his asset, later nobody can approve but everyone can claim his asset only once", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })
      await lockBox.connect(user1).approveAsset(1);

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0);

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await lockBox.connect(user1).claimAsset(1);
      await lockBox.connect(user2).claimAsset(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(0);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(1);

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;

    })

    it("cancelation after other user approved his asset, later nobody can approve but everyone can claim his asset only once", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })
      await lockBox.connect(user2).approveAsset(1);


      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(0);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0);

      await lockBox.connect(user1).cancelLockBox(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0);

      await lockBox.connect(user1).claimAsset(1);
      await lockBox.connect(user2).claimAsset(1);

      lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(0);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(1);

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user1).claimAsset(1)).to.be.reverted;

      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).claimAsset(1)).to.be.reverted;

    })

    it("Cannot cancel if both users approve their assets", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0") })
      await lockBox.connect(user1).approveAsset(1);
      await lockBox.connect(user2).approveAsset(1);

      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(1);
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1);
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0);

      await expect(lockBox.connect(user1).cancelLockBox(1)).to.be.reverted;
      
    })

  })

  describe("As owner", async () => {

    it("can withdraw funds", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await lockBox.connect(user2).createLockBox(
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await lockBox.connect(user3).createLockBox(
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      let balance_of_contract = await provider.getBalance(lockBox.address);
      expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.3"))

      await lockBox.withdrawFunds();

      balance_of_contract = await provider.getBalance(lockBox.address);
      expect(balance_of_contract).to.equal(ethers.utils.parseEther("0"))

    })

    it("cannot withdraw funds are null", async () => {
      expect(lockBox.withdrawFunds()).to.be.reverted;
    })

    it("can update box fee", async () => {

      expect(await lockBox.boxFee()).to.be.equal(ethers.utils.parseEther("0.1"))
      await lockBox.updateBoxFee(ethers.utils.parseEther("0.2"));
      expect(await lockBox.boxFee()).to.be.equal(ethers.utils.parseEther("0.2"))

    })

    it("cannot update box fee to 0", async () => {
      expect(lockBox.updateBoxFee(ethers.utils.parseEther("0"))).to.be.reverted;
    })

  })

  describe("Deployment =>", () => {

    it("deploys successfully", async () => {

      expect(lockBox.address).to.be.properAddress;
      expect(testToken.address).to.be.properAddress;
      expect(testNFT.address).to.be.properAddress;

    });

  });

  describe("Trade NFT ", async () => {

    describe("Trade NFT for a ETHs ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")


      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        let balance_of_contract: string;
        let eth_balance_of_contract: string;

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await expect(() =>
          lockBox.connect(user2).lockAsset(1, {
            value: ethers.utils.parseEther("1.0"),
          })
        ).to.changeBalance(lockBox, ethers.utils.parseEther("1"))


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

        balance_of_contract = await provider.getBalance(lockBox.address);
        eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("1.1")
      })

      it("Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);
        await lockBox.connect(user2).lockAsset(1, {
          value: ethers.utils.parseEther("1.0")
        });
        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


      })

      it("Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);
        await lockBox.connect(user2).lockAsset(1, {
          value: ethers.utils.parseEther("1.0")
        });
        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await expect(() =>
          lockBox.connect(user1).claimAsset(1)
        ).to.changeBalance(lockBox, `-${ethers.utils.parseEther("1")}`)

        await lockBox.connect(user2).claimAsset(1);

        const lockBoxID = await lockBox.counter();
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);

        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);



        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(1);
        expect(constract_nft_balance).to.equal(0);


      })

    })

    describe("Trade NFT for a ERC20 Tokens ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);


        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")

      })

      it("Both users can lock their assetss ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testToken.mint(user2.address, ethers.utils.parseEther("100"))
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("100"))
        await lockBox.connect(user2).lockAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("100"));
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

        const nft_balance_of_contract = await testNFT.balanceOf(lockBox.address);
        expect(nft_balance_of_contract).to.be.equal(1)

        const token_balance_of_contract = await testToken.balanceOf(lockBox.address);
        expect(token_balance_of_contract).to.be.equal(ethers.utils.parseEther("100"))

      })

      it("Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testToken.mint(user2.address, ethers.utils.parseEther("100"))
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("100"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);



        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("100"));
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("100"));

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(1);

      })

      it("Both users can claim their asset ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testToken.mint(user2.address, ethers.utils.parseEther("100"))
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("100"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1)
        await lockBox.connect(user2).claimAsset(1);

        const lockBoxID = await lockBox.counter();
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("100"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("0"));

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(1);
        expect(constract_nft_balance).to.equal(0);


      })

    })

    describe("Trade NFT for an NFT ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.NFT, testNFT2.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")


      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.NFT, testNFT2.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testNFT2.mint(user2.address);
        await testNFT2.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);

        let user1_nft1_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft1_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft1_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft1_balance).to.equal(0);
        expect(user2_nft1_balance).to.equal(0);
        expect(constract_nft1_balance).to.equal(1);

        let user1_nft2_balance = Number(await testNFT2.balanceOf(user1.address))
        let user2_nft2_balance = Number(await testNFT2.balanceOf(user2.address))
        let constract_nft2_balance = Number(await testNFT2.balanceOf(lockBox.address))
        expect(user1_nft2_balance).to.equal(0);
        expect(user2_nft2_balance).to.equal(0);
        expect(constract_nft2_balance).to.equal(1);

      })

      it("Both users can spprove their assets", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.NFT, testNFT2.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testNFT2.mint(user2.address);
        await testNFT2.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);

        let user1_nft1_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft1_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft1_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft1_balance).to.equal(0);
        expect(user2_nft1_balance).to.equal(0);
        expect(constract_nft1_balance).to.equal(1);

        let user1_nft2_balance = Number(await testNFT2.balanceOf(user1.address))
        let user2_nft2_balance = Number(await testNFT2.balanceOf(user2.address))
        let constract_nft2_balance = Number(await testNFT2.balanceOf(lockBox.address))
        expect(user1_nft2_balance).to.equal(0);
        expect(user2_nft2_balance).to.equal(0);
        expect(constract_nft2_balance).to.equal(1);


      })

      it("Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.NFT, testNFT.address, 0, 1,
          AssetType.NFT, testNFT2.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        await testNFT.mint(user1.address);
        await testNFT.connect(user1).approve(lockBox.address, 0)
        await lockBox.connect(user1).lockAsset(1);

        await testNFT2.mint(user2.address);
        await testNFT2.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1)
        await lockBox.connect(user2).claimAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);

        let user1_nft1_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft1_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft1_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft1_balance).to.equal(0);
        expect(user2_nft1_balance).to.equal(1);
        expect(constract_nft1_balance).to.equal(0);

        let user1_nft2_balance = Number(await testNFT2.balanceOf(user1.address))
        let user2_nft2_balance = Number(await testNFT2.balanceOf(user2.address))
        let constract_nft2_balance = Number(await testNFT2.balanceOf(lockBox.address))
        expect(user1_nft2_balance).to.equal(1);
        expect(user2_nft2_balance).to.equal(0);
        expect(constract_nft2_balance).to.equal(0);

      })

    })

  })

  describe("Trade ERC20", async () => {

    describe("Trade ERC20 Tokens for ETHs ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("2"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.1"))

      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        const allownce = await testToken.allowance(user1.address, lockBox.address);
        expect(allownce).to.be.equal(ethers.utils.parseEther("200"));

        await lockBox.connect(user1).lockAsset(1);

        await expect(() =>
          lockBox.connect(user2).lockAsset(1, {
            value: ethers.utils.parseEther("2"),
          })
        ).to.changeBalance(lockBox, ethers.utils.parseEther("2"))


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0)
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("2"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("200"));


        const balanceContract = await provider.getBalance(lockBox.address);
        expect(balanceContract).to.equal(ethers.utils.parseEther("2.1"));

      })

      it("Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        await lockBox.connect(user1).lockAsset(1);
        await lockBox.connect(user2).lockAsset(1, { value: ethers.utils.parseEther("2") })

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0)
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("2"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("200"));

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("2.1"))


      })

      it("Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        await lockBox.connect(user1).lockAsset(1);

        await lockBox.connect(user2).lockAsset(1, { value: ethers.utils.parseEther("2") })
        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await expect(() =>
          lockBox.connect(user1).claimAsset(1)
        ).to.changeBalance(lockBox, `-${ethers.utils.parseEther("2")}`)

        await lockBox.connect(user2).claimAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1)
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("2"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("200"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("0"));

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.1"))



      })

    })

    describe("Trade ERC20 Tokens for ERC20 Tokens ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.1"))

      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        const allownce = await testToken.allowance(user1.address, lockBox.address);
        expect(allownce).to.be.equal(ethers.utils.parseEther("200"));

        await lockBox.connect(user1).lockAsset(1);

        await testToken2.mint(user2.address, ethers.utils.parseEther("500"))
        await testToken2.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        const allownce2 = await testToken2.allowance(user2.address, lockBox.address);
        expect(allownce2).to.be.equal(ethers.utils.parseEther("500"));

        await lockBox.connect(user2).lockAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("200"));

        let user1_Token2_balance = await testToken2.balanceOf(user1.address)
        let user2_Token2_balance = await testToken2.balanceOf(user2.address)
        let constract_Token2_balance = await testToken2.balanceOf(lockBox.address)
        expect(user1_Token2_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token2_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token2_balance).to.equal(ethers.utils.parseEther("500"));


      })

      it("Both users can approve their assets", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        await lockBox.connect(user1).lockAsset(1);

        await testToken2.mint(user2.address, ethers.utils.parseEther("500"))
        await testToken2.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("200"));

        let user1_Token2_balance = await testToken2.balanceOf(user1.address)
        let user2_Token2_balance = await testToken2.balanceOf(user2.address)
        let constract_Token2_balance = await testToken2.balanceOf(lockBox.address)
        expect(user1_Token2_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token2_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token2_balance).to.equal(ethers.utils.parseEther("500"));

      })

      it("Both users can claim thier assets", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
          AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("200"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("200"))
        await lockBox.connect(user1).lockAsset(1);

        await testToken2.mint(user2.address, ethers.utils.parseEther("500"))
        await testToken2.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1);
        await lockBox.connect(user2).claimAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("200"));
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("200"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("0"));

        let user1_Token2_balance = await testToken2.balanceOf(user1.address)
        let user2_Token2_balance = await testToken2.balanceOf(user2.address)
        let constract_Token2_balance = await testToken2.balanceOf(lockBox.address)
        expect(user1_Token2_balance).to.equal(ethers.utils.parseEther("500"));
        expect(user2_Token2_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token2_balance).to.equal(ethers.utils.parseEther("0"));


      })

    })

    describe("Trade ERC20 Tokens for an NFT ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);


        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")

      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("100"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
        const allownce = await testToken.allowance(user1.address, lockBox.address);
        expect(allownce).to.be.equal(ethers.utils.parseEther("100"));
        await lockBox.connect(user1).lockAsset(1);

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let user1_Token_balance = await testToken.balanceOf(user1.address);
        let user2_Token_balance = await testToken.balanceOf(user2.address);
        let constract_Token_balance = await testToken.balanceOf(lockBox.address);
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("100"));

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address));
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address));
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address));
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(1);


      })

      it(" Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("100"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
        await lockBox.connect(user1).lockAsset(1);

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("100"));
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("100"));

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(1);

      })

      it(" Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        await testToken.mint(user1.address, ethers.utils.parseEther("100"))
        await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
        await lockBox.connect(user1).lockAsset(1);

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1)
        await lockBox.connect(user2).claimAsset(1);



        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("100"));
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);

        let user1_Token_balance = await testToken.balanceOf(user1.address)
        let user2_Token_balance = await testToken.balanceOf(user2.address)
        let constract_Token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_Token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_Token_balance).to.equal(ethers.utils.parseEther("100"));
        expect(constract_Token_balance).to.equal(ethers.utils.parseEther("0"));

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(1);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(0);



      })

    })
  })

  describe("Trade ETHs", async () => {

    describe("Trade ETHs for ERC20 Tokens  ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
          AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")


      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
          AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )


        expect(Number(await lockBox.counter())).to.equal(1)


        await expect(() =>
          lockBox.connect(user1).lockAsset(1, {
            value: ethers.utils.parseEther("1.0"),
          })
        ).to.changeBalance(lockBox, ethers.utils.parseEther("1"))

        await testToken.mint(user2.address, ethers.utils.parseEther("500"));
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        await lockBox.connect(user2).lockAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("1"));

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));


        let user1_token_balance = await testToken.balanceOf(user1.address)
        let user2_token_balance = await testToken.balanceOf(user2.address)
        let constract_token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_token_balance).to.equal(ethers.utils.parseEther("500"));

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("1.1"))

      })

      it("Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
          AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )


        expect(Number(await lockBox.counter())).to.equal(1)


        await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") });

        await testToken.mint(user2.address, ethers.utils.parseEther("500"));
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("1.0"));

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));



        let user1_token_balance = await testToken.balanceOf(user1.address)
        let user2_token_balance = await testToken.balanceOf(user2.address)
        let constract_token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(user2_token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_token_balance).to.equal(ethers.utils.parseEther("500"));

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("1.1"))

      })

      it("Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.TOKEN, testToken.address, 1, web3.utils.toWei('500', 'ether'),
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )


        expect(Number(await lockBox.counter())).to.equal(1)


        await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") });

        await testToken.mint(user2.address, ethers.utils.parseEther("500"));
        await testToken.connect(user2).approve(lockBox.address, ethers.utils.parseEther("500"))
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1)
        await expect(() =>
          lockBox.connect(user2).claimAsset(1)
        ).to.changeBalance(lockBox, `-${ethers.utils.parseEther("1")}`)


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);
        expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("1.0"));

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);
        expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500"));



        let user1_token_balance = await testToken.balanceOf(user1.address)
        let user2_token_balance = await testToken.balanceOf(user2.address)
        let constract_token_balance = await testToken.balanceOf(lockBox.address)
        expect(user1_token_balance).to.equal(ethers.utils.parseEther("500"));
        expect(user2_token_balance).to.equal(ethers.utils.parseEther("0"));
        expect(constract_token_balance).to.equal(ethers.utils.parseEther("0"));

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.1"))


      })

    })

    describe("Trade ETHs for an NFT  ", async () => {

      it("A user can create a lockbox by paying fee ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(0);
        expect(lockBoxInfo.assetB.owner).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);


        let balance_of_contract = await provider.getBalance(lockBox.address);
        let eth_balance_of_contract = ethers.utils.formatUnits(balance_of_contract, "ether");
        expect(eth_balance_of_contract).to.equal("0.1")


      })

      it("Both users can lock their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)


        await expect(() =>
          lockBox.connect(user1).lockAsset(1, {
            value: ethers.utils.parseEther("1.0"),
          })
        ).to.changeBalance(lockBox, ethers.utils.parseEther("1"))

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);


        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(0);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(1);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("1.1"))

      })

      it("Both users can approve their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)


        await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") })

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);

        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(NULL_ADDRESS);

        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(0);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(1);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("1.1"))


      })

      it("Both users can claim their assets ", async () => {

        let latestBlock = await ethers.provider.getBlock("latest")
        const OneDayduration = Number(await time.duration.days(1));

        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.NFT, testNFT.address, 0, 1,
          OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )

        expect(Number(await lockBox.counter())).to.equal(1)


        await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") })

        await testNFT.mint(user2.address);
        await testNFT.connect(user2).approve(lockBox.address, 0)
        await lockBox.connect(user2).lockAsset(1);

        await lockBox.connect(user1).approveAsset(1);
        await lockBox.connect(user2).approveAsset(1);

        await lockBox.connect(user1).claimAsset(1)
        await expect(() =>
          lockBox.connect(user2).claimAsset(1)
        )
          .to.changeBalance(lockBox, `-${ethers.utils.parseEther("1")}`)

        const lockBoxID = await lockBox.counter()
        let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
        expect(lockBoxInfo.status).to.equal(1);
        expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetA.owner).to.equal(user1.address);
        expect(lockBoxInfo.assetA.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetA.claimedBy).to.equal(user2.address);
        expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
        expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
        expect(lockBoxInfo.assetB.approvalStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
        expect(lockBoxInfo.assetB.claimedBy).to.equal(user1.address);

        let user1_nft_balance = Number(await testNFT.balanceOf(user1.address))
        let user2_nft_balance = Number(await testNFT.balanceOf(user2.address))
        let constract_nft_balance = Number(await testNFT.balanceOf(lockBox.address))
        expect(user1_nft_balance).to.equal(1);
        expect(user2_nft_balance).to.equal(0);
        expect(constract_nft_balance).to.equal(0);

        let balance_of_contract = await provider.getBalance(lockBox.address);
        expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.1"))


      })

    })

  })

  describe("After expiry", async () => {

    it("no one can deposit their asset once the lockbox got expired", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await network.provider.send("evm_increaseTime", [Number(time.duration.days(1))])
      await network.provider.send("evm_mine")

      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);

      await expect(lockBox.connect(user1).lockAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;
      
    })

    it("no one can approve their asset once the lockbox got expired, Later, they can claim their orignal asset", async ()=> {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox (
        AssetType.NFT, testNFT.address, 0, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )
      
      await testNFT.mint(user1.address);
      await testNFT.connect(user1).approve(lockBox.address, 0);
      await lockBox.connect(user1).lockAsset(1);
      await lockBox.connect(user2).lockAsset(1, {value: ethers.utils.parseEther("1.0")});
      

      let balance_of_contract = await provider.getBalance(lockBox.address);
      expect(ethers.utils.formatUnits(balance_of_contract, "ether")).to.be.equal("1.1")
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(1)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(0)

      await network.provider.send("evm_increaseTime", [Number(time.duration.days(1))]);
      await network.provider.send("evm_mine");

      await expect(lockBox.connect(user1).approveAsset(1)).to.be.reverted;
      await expect(lockBox.connect(user2).approveAsset(1)).to.be.reverted;
      
      await lockBox.connect(user1).claimAsset(1);
      await lockBox.connect(user2).claimAsset(1);
      
      const lockBoxID = await lockBox.counter();
      
      let lockBoxInfo = await lockBox.lockBoxInfo(lockBoxID);
      expect(lockBoxInfo.status).to.equal(2);
      
      expect(lockBoxInfo.assetA.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetA.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetA.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetA.claimedBy).to.equal(user1.address);
      
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(1);
      expect(lockBoxInfo.assetB.claimedBy).to.equal(user2.address);
      
      balance_of_contract = await provider.getBalance(lockBox.address);
      expect(ethers.utils.formatUnits(balance_of_contract, "ether")).to.be.equal("0.1")
      expect(Number(await testNFT.balanceOf(lockBox.address))).to.be.equal(0)
      expect(Number(await testNFT.balanceOf(user1.address))).to.be.equal(1)
      
    })

  })

});

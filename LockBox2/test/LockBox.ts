const { assert, expect } = require('chai');
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
import { Signer, Contract, ContractFactory, BigNumber } from "ethers";
import { LockBox, LockBox__factory, TestNFT, TestNFT__factory, TestToken, TestToken__factory } from "../typechain";
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
// import {ethers, waffle, utils} from "hardhat"

enum AssetType { NFT, TOKEN, COIN }
// enum AssetNumber {ONE,TWO}
// enum Status {PENDING, SUCCEED}
// enum ClaimStatus {NOT_CLAIMED, CLAIMED}
// enum LockStatus {NOT_LOCKED, LOCKED}
// enum ApprovalStatus {NOT_APPROVED, APPROVED}




const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";


let lockBox: LockBox, testToken: TestToken, testToken2: TestToken, testNFT: TestNFT, testNFT2: TestNFT
let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress


describe('LockBox Test Stack', () => {

  const consoleMsg = async (id: number) => {
    // const lockBoxInfo = await lockBox.lockBoxInfo(id);

    console.log("");
    // console.log("=======================================");
    // console.log("lockBoxOwner", lockBoxInfo.lockBoxOwner);
    // console.log("expiryTime", Number(lockBoxInfo.expiryTime));
    // console.log("status", Number(lockBoxInfo.status));

    // console.log("");
    // console.log("===== Asset A =====")
    // console.log("assetType", Number(lockBoxInfo.assetA.assetType));
    // console.log("owner", lockBoxInfo.assetA.owner);
    // console.log("assetAddress", lockBoxInfo.assetA.assetAddress);
    // console.log("assetID", Number(lockBoxInfo.assetA.assetID));
    // console.log("assetQuantity", Number(lockBoxInfo.assetA.assetQuantity));
    // console.log("lockStatus", Number(lockBoxInfo.assetA.lockStatus));
    // console.log("approvalStatus", Number(lockBoxInfo.assetA.approvalStatus));
    // console.log("claimStatus", Number(lockBoxInfo.assetA.claimStatus));


    // console.log("");
    // console.log("===== Asset B =====")
    // console.log("assetType", Number(lockBoxInfo.assetB.assetType));
    // console.log("owner", lockBoxInfo.assetB.owner);
    // console.log("assetAddress", lockBoxInfo.assetB.assetAddress);
    // console.log("assetID", Number(lockBoxInfo.assetB.assetID));
    // console.log("assetQuantity", Number(lockBoxInfo.assetB.assetQuantity));
    // console.log("lockStatus", Number(lockBoxInfo.assetB.lockStatus));
    // console.log("approvalStatus", Number(lockBoxInfo.assetB.approvalStatus));
    // console.log("claimStatus", Number(lockBoxInfo.assetB.claimStatus));
    console.log("");


    let NFTbalanceOfUser1 = Number(await testNFT.balanceOf(user1.address))
    let TOKENbalanceOfUser1 = Number(await testToken.balanceOf(user1.address))
    // let ETHbalanceUser1 = await web3.eth.getBalance(user1.address)
    const balanceUser1 = await provider.getBalance(user1.address);
    let ETHbalanceUser1 = ethers.utils.formatUnits(balanceUser1, "ether");


    console.log("balances,          NFT,        TOKEN,       ETH ")
    console.log(`User 1 =====>,       ${NFTbalanceOfUser1},        ${TOKENbalanceOfUser1},     ${ETHbalanceUser1}`)
    // console.log("TOKEN balance of User1 ", TOKENbalanceOfUser1)
    // console.log("ETH balance of User1 ", web3.utils.fromWei(ETHbalanceUser1, 'ether'))


    let NFTbalanceOfUser2 = Number(await testNFT.balanceOf(user2.address))
    let TOKENbalanceOfUser2 = Number(await testToken.balanceOf(user2.address))
    // let ETHbalanceUser2 = await web3.eth.getBalance(user2.address)
    const balanceUser2 = await provider.getBalance(user2.address);
    let ETHbalanceUser2 = ethers.utils.formatUnits(balanceUser2, "ether");


    console.log(`User 2 =====>,       ${NFTbalanceOfUser2},        ${TOKENbalanceOfUser2},     ${ETHbalanceUser2} `)

    // console.log("NFT balance of User2 ", NFTbalanceOfUser2)
    // console.log("TOKEN balance of User1 ", TOKENbalanceOfUser2)
    // console.log("ETH balance of User2 ", web3.utils.fromWei(ETHbalanceUser2, 'ether'))

    let NFTbalanceOFLockContract = Number(await testNFT.balanceOf(lockBox.address))
    let TOKENbalanceOfContract = Number(await testToken.balanceOf(lockBox.address))
    // let ETHbalanceContract = await web3.eth.getBalance(lockBox.address)
    const balanceContract = await provider.getBalance(lockBox.address);
    let ETHbalanceContract = ethers.utils.formatUnits(balanceContract, "ether");

    // console.log(`Contract ===>,       ${NFTbalanceOFLockContract},        ${TOKENbalanceOfContract},     ${web3.utils.fromWei(ETHbalanceContract, 'ether')} `)
    console.log(`Contract ===>,       ${NFTbalanceOFLockContract},        ${TOKENbalanceOfContract},     ${ETHbalanceContract} `)

    // console.log("NFT balance of contract ", NFTbalanceOFLockContract)
    // console.log("TOKEN balance of Contract ", TOKENbalanceOfContract)
    // console.log("ETH balance of Contract ", web3.utils.fromWei(ETHbalanceContract, 'ether'))

    console.log("=======================================");
    console.log("");
    console.log("");



  }

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const LockBox: LockBox__factory = await ethers.getContractFactory("LockBox")
    const TestToken: TestToken__factory = await ethers.getContractFactory('TestToken')
    const TestNFT: TestNFT__factory = await ethers.getContractFactory('TestNFT')

    lockBox = await LockBox.deploy()
    testToken = await TestToken.deploy()
    testToken2 = await TestToken.deploy()
    testNFT = await TestNFT.deploy()
    testNFT2 = await TestNFT.deploy()

  });

  describe("Deployment =>", () => {

    it("deploys successfully", async () => {

      expect(lockBox.address).to.be.properAddress;
      expect(testToken.address).to.be.properAddress;
      expect(testNFT.address).to.be.properAddress;

    });

  });

  
  describe("Trade NFT for a ETHs ", async () => {

    it("A user can create a lockbox by paying fee ", async () => {

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      let balance_of_contract: string;
      let eth_balance_of_contract: string;

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.NFT, testNFT2.address, 1, 1,
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.NFT, testNFT2.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
      await lockBox.connect(user1).lockAsset(1);

      await testNFT2.connect(user2).mintNFT();
      await testNFT2.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.NFT, testNFT2.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
      await lockBox.connect(user1).lockAsset(1);

      await testNFT2.connect(user2).mintNFT();
      await testNFT2.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.NFT, testNFT.address, 1, 1,
        AssetType.NFT, testNFT2.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      await testNFT.connect(user1).mintNFT();
      await testNFT.connect(user1).approve(lockBox.address, 1)
      await lockBox.connect(user1).lockAsset(1);

      await testNFT2.connect(user2).mintNFT();
      await testNFT2.connect(user2).approve(lockBox.address, 1)
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


  describe("Trade ERC20 Tokens for ETHs ", async () => {

    it("A user can create a lockbox by paying fee ", async () => {

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.COIN, NULL_ADDRESS, 1, ethers.utils.parseEther("2"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("200"),
        AssetType.TOKEN, testToken2.address, 0, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)

      await testToken.mint(user1.address, ethers.utils.parseEther("100"))
      await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
      const allownce = await testToken.allowance(user1.address, lockBox.address);
      expect(allownce).to.be.equal(ethers.utils.parseEther("100"));
      await lockBox.connect(user1).lockAsset(1);

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)

      await testToken.mint(user1.address, ethers.utils.parseEther("100"))
      await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
      await lockBox.connect(user1).lockAsset(1);

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.TOKEN, testToken.address, 0, ethers.utils.parseEther("100"),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)

      await testToken.mint(user1.address, ethers.utils.parseEther("100"))
      await testToken.connect(user1).approve(lockBox.address, ethers.utils.parseEther("100"))
      await lockBox.connect(user1).lockAsset(1);

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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


  describe("Trade ETHs for ERC20 Tokens  ", async () => {

    it("A user can create a lockbox by paying fee ", async () => {

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
        AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
        AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
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
      expect(lockBoxInfo.assetA.assetQuantity).to.equal(ethers.utils.parseEther("1") );
           
      expect(lockBoxInfo.assetB.lockStatus).to.equal(1);
      expect(lockBoxInfo.assetB.owner).to.equal(user2.address);
      expect(lockBoxInfo.assetB.approvalStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimStatus).to.equal(0);
      expect(lockBoxInfo.assetB.claimedBy).to.equal(NULL_ADDRESS);
      expect(lockBoxInfo.assetB.assetQuantity).to.equal(ethers.utils.parseEther("500") );


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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, ethers.utils.parseEther("1.0"),
        AssetType.TOKEN, testToken.address, 1, ethers.utils.parseEther("500"),
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )


      expect(Number(await lockBox.counter())).to.equal(1)


      await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0")});

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

        const latestTime = Number((await time.latest()));
        const OneDayduration = Number(await time.duration.days(1));
  
        await lockBox.connect(user1).createLockBox(
          AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
          AssetType.TOKEN, testToken.address, 1, web3.utils.toWei('500', 'ether'),
          latestTime + OneDayduration,
          { value: ethers.utils.parseEther("0.1") }
        )
  
  
        expect(Number(await lockBox.counter())).to.equal(1)
  
  
        await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0")});
  
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)


      await expect(() =>
        lockBox.connect(user1).lockAsset(1, {
          value: ethers.utils.parseEther("1.0"),
        })
      ).to.changeBalance(lockBox, ethers.utils.parseEther("1"))

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)


      await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") })

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await lockBox.connect(user1).createLockBox(
        AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
        AssetType.NFT, testNFT.address, 1, 1,
        latestTime + OneDayduration,
        { value: ethers.utils.parseEther("0.1") }
      )

      expect(Number(await lockBox.counter())).to.equal(1)


      await lockBox.connect(user1).lockAsset(1, { value: ethers.utils.parseEther("1.0") })

      await testNFT.connect(user2).mintNFT();
      await testNFT.connect(user2).approve(lockBox.address, 1)
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

});

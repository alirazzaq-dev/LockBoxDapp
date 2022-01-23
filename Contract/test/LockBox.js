var LockBox = artifacts.require("LockBox.sol");
var TestToken = artifacts.require("TestToken.sol");
var TestNFT = artifacts.require("TestNFT.sol");

const { balance, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// enum AssetNumber {ONE,TWO}
// enum AssetType {NFT, TOKEN, COIN}
// enum Status {PENDING_DEPOSITE, PENDING_APPROVAL, SUCCEED, FAILED}
// enum LockStatus {NOT_LOCKED, LOCKED}
// enum ApprovalStatus {NOT_APPROVED, APPROVED}

const AssetType = {
  NFT : 0, 
  TOKEN: 1, 
  COIN: 2
}


const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("LockerFactory", (accounts) => {
  
  let lockBox;
  let testToken;
  let testNFT
  
  let lockBoxAddress;
  let testTokenAddress;
  let testNFTAddress;
  
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const user6 = accounts[6];
  const user7 = accounts[7];
  const devTeam = accounts[8];
  const dev = accounts[9];
  
  const consoleMsg = async (id) => {
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

    let NFTbalanceOfUser1 = Number( await testNFT.balanceOf(user1) )
    console.log("NFT balance of User1 ", NFTbalanceOfUser1)

    let TOKENbalanceOfUser1 = Number( await testToken.balanceOf(user1) )
    console.log("TOKEN balance of User1 ", TOKENbalanceOfUser1)

    let ETHbalanceUser1 = await web3.eth.getBalance(user1)
    console.log("ETH balance of User1 ", web3.utils.fromWei(ETHbalanceUser1, 'ether'))



    let NFTbalanceOfUser2 = Number( await testNFT.balanceOf(user2) )
    console.log("NFT balance of User2 ", NFTbalanceOfUser2)

    let TOKENbalanceOfUser2 = Number( await testToken.balanceOf(user2) )
    console.log("TOKEN balance of User1 ", TOKENbalanceOfUser2)

    let ETHbalanceUser2 = await web3.eth.getBalance(user2)
    console.log("ETH balance of User2 ", web3.utils.fromWei(ETHbalanceUser2, 'ether'))



    let NFTbalanceOFLockContract = Number( await testNFT.balanceOf(lockBoxAddress) )
    console.log("NFT balance of contract ", NFTbalanceOFLockContract)

    let TOKENbalanceOfContract = Number( await testToken.balanceOf(lockBoxAddress) )
    console.log("TOKEN balance of Contract ", TOKENbalanceOfContract)

    let ETHbalanceContract = await web3.eth.getBalance(lockBoxAddress)
    console.log("ETH balance of Contract ", web3.utils.fromWei(ETHbalanceContract, 'ether'))


    console.log("=======================================");
    console.log("");
    console.log("");

  
  
  }

  beforeEach(async () => {
    lockBox = await LockBox.new();
    lockBoxAddress = await lockBox.address;

    testToken = await TestToken.new();
    testTokenAddress = await testToken.address;

    testNFT = await TestNFT.new();
    testNFTAddress = await testNFT.address;

  });

  // describe("Deployment =>", () => {

  //     it("deploys successfully", async () => {
   
  //       assert.notEqual(lockBoxAddress, 0x0);
  //       assert.notEqual(lockBoxAddress, "");
  //       console.log("Count of LockBox => ", Number(await lockBox.counter()))
        
        
  //       assert.notEqual(testTokenAddress, 0x0);
  //       assert.notEqual(testTokenAddress, "");

  //       console.log("Name of Token => ", await testToken.name())
  //       console.log("Total supply of Token => ", Number(await testToken.totalSupply()) )
          

  //       assert.notEqual(testNFTAddress, 0x0);
  //       assert.notEqual(testNFTAddress, "");

  //       console.log("Name of NFT => ", await testNFT.name())
  //       // console.log("Total supply of NFT => ", Number(await testNFT.totalSupply()) )
        
  //     });
              
  // });


  describe('LockBox', () => {

    // it("Trade NFT for a ETHs ", async ()=> {

    //   const latestTime = Number((await time.latest()));
    //   const OneDayduration = Number(await time.duration.days(1));

    //   await testNFT.mint({from: user1});

    //   await lockBox.CreateLockBox(
    //     AssetType.NFT, testNFTAddress, 1, 1,
    //     AssetType.COIN, NULL_ADDRESS, 0, web3.utils.toWei('1', 'ether'),
    //     latestTime + OneDayduration,
    //     {from: user1, value: web3.utils.toWei('0.1', 'ether')}
    //     )

    //     console.log("Count of LockBox => ", Number(await lockBox.counter()))
      
    //     await consoleMsg(1);
        
    //     await testNFT.approve(lockBoxAddress, 1, {from: user1})
        
    //     const getApproved = await testNFT.getApproved(1);
    //     assert.equal(getApproved, lockBoxAddress);
    //     // console.log("getApproved address", getApproved)
    //     // console.log("lockBoxAddress ", lockBoxAddress)
        
        
    //     await lockBox.LockAssetA(1, {from: user1});
    //     console.log("");
    //     console.log("After locking First asset");
    //     await consoleMsg(1);

    //     await lockBox.LockAssetB(1, {from: user2, value: web3.utils.toWei('1', 'ether')});
    //     console.log("");
    //     console.log("After locking both assets");
    //     await consoleMsg(1);


    //     await lockBox.ApproveAssetA(1, {from: user1});
    //     console.log("");
    //     console.log("After Approving asset A");
    //     await consoleMsg(1);


    //     await lockBox.ApproveAssetB(1, {from: user2});
    //     console.log("");
    //     console.log("After Approving both assets");
    //     await consoleMsg(1);


    //     await lockBox.ClaimAssetA(1, {from: user2});
    //     console.log("");
    //     console.log("After Claiming Asset A");
    //     await consoleMsg(1);
        

    //     await lockBox.ClaimAssetB(1, {from: user1});
    //     console.log("");
    //     console.log("After Claiming both Assets");
    //     await consoleMsg(1);

  
    // })

    it("Trade NFT for a ERC Tokens ", async ()=> {

      const latestTime = Number((await time.latest()));
      const OneDayduration = Number(await time.duration.days(1));

      await testNFT.mint({from: user1});
      await testToken.mint(user2, 1_000_000);

      await lockBox.CreateLockBox(
        AssetType.NFT, testNFTAddress, 1, 1,
        AssetType.TOKEN, testTokenAddress, 0, 1_000_000,
        latestTime + OneDayduration,
        {from: user1, value: web3.utils.toWei('0.1', 'ether')}
        )

        console.log("Count of LockBox => ", Number(await lockBox.counter()))
      
        await consoleMsg(1);
        
        await testNFT.approve(lockBoxAddress, 1, {from: user1})
        const getApproved = await testNFT.getApproved(1);
        assert.equal(getApproved, lockBoxAddress);        
        
        await lockBox.LockAssetA(1, {from: user1});
        console.log("");
        console.log("After locking First asset");
        await consoleMsg(1);


        await testToken.approve(lockBoxAddress, 1_000_000, {from: user2})
        const allownce = await testToken.allowance(user2, lockBoxAddress);
        assert.equal(Number(allownce), 1_000_000);

        await lockBox.LockAssetB(1, {from: user2});
        console.log("");
        console.log("After locking both assets");
        await consoleMsg(1);


        await lockBox.ApproveAssetA(1, {from: user1});
        console.log("");
        console.log("After Approving asset A");
        await consoleMsg(1);


        await lockBox.ApproveAssetB(1, {from: user2});
        console.log("");
        console.log("After Approving both assets");
        await consoleMsg(1);


        await lockBox.ClaimAssetA(1, {from: user2});
        console.log("");
        console.log("After Claiming Asset A");
        await consoleMsg(1);
        

        await lockBox.ClaimAssetB(1, {from: user1});
        console.log("");
        console.log("After Claiming both Assets");
        await consoleMsg(1);

  
    })
    
  });
  


})

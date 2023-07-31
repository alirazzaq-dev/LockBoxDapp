// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

// import {console} from "hardhat/console.sol";

contract LockBox is Ownable, ERC721Holder, ERC1155Holder {

    error LockBox__NOT_ALLOWED();
    error LockBox__NOT_PENDING_ANYMORE();
    error LockBox__EXPIRED();
    error LockBox__INSUFFICIENT_FUNDS();
    error LockBox__NOT_AVAILABLE();
    error LockBox__OUT_OF_BOUND_REQUEST();
    error LockBox__INSUFFICIENT_LOCKING_FUNDS();
    error LockBox__EXPIRY_LIMIT_EXCEEDING();
    error LockBox__INSUFFICIENT_FUNDS_FOR_SWAP();

    uint256 private s_expiryTime = 1 days;
    uint256 private s_counter;
    uint256 private s_boxFee = 0.01 ether;
    mapping (uint256 => LockBoxInfo) private s_lockBoxInfo;


    enum AssetType {NFT, TOKEN, COIN, ERC1155}
    enum Status {PENDING, SUCCEED, CANCELLED}


    struct Asset {
        AssetType assetType;
        address assetAddress;
        uint assetID;
        uint assetQuantity;
    }

    struct LockBoxInfo {
        uint256 boxId;
        address owner;
        uint256 expiryTime;
        Status status;
        Asset assetA;
        Asset assetB;
        address claimedBy;
    }


    function createLockBox(
        AssetType assetAtype, address assetAaddress, uint256 assetAID, uint256 assetAQuantity,
        AssetType assetBtype, address assetBaddress, uint256 assetBID, uint256 assetBQuantity,
        uint256 expiryTime
        ) public payable {
        

        if(msg.value < s_boxFee){
            revert LockBox__INSUFFICIENT_FUNDS();
        }

        if(expiryTime > s_expiryTime){
            revert LockBox__EXPIRY_LIMIT_EXCEEDING();
        } 

    
        if(assetAtype == AssetType.NFT) {
            IERC721(assetAaddress).transferFrom(msg.sender, address(this), assetAID);
        }
        else if(assetAtype == AssetType.ERC1155) {
            IERC1155(assetAaddress).safeTransferFrom(msg.sender, address(this), assetAID, assetAQuantity, "");
        }
        else if(assetAtype == AssetType.TOKEN) {
            IERC20(assetAaddress).transferFrom(msg.sender, address(this), assetAQuantity);
        }
        else if(assetAtype == AssetType.COIN) {
            if(msg.value < assetAQuantity + s_boxFee){
                revert LockBox__INSUFFICIENT_LOCKING_FUNDS();
            }
        }


        Asset memory assetA = Asset ({
            assetType: assetAtype,
            assetAddress: assetAaddress,
            assetID: assetAID,
            assetQuantity: assetAQuantity
        });

        Asset memory assetB = Asset ({
            assetType: assetBtype,
            assetAddress: assetBaddress,
            assetID: assetBID,
            assetQuantity: assetBQuantity
        });

        uint256 id = ++s_counter;

        LockBoxInfo memory lockBox =  LockBoxInfo ({
            boxId: id,
            owner: msg.sender,
            expiryTime: block.timestamp + expiryTime,
            status: Status.PENDING,
            assetA: assetA,
            assetB: assetB,
            claimedBy: address(0)
        });

        s_lockBoxInfo[id] = lockBox;
   
    }

    function swapAssets(uint256 boxId) public payable {
        
        LockBoxInfo memory lockBox = s_lockBoxInfo[boxId];
        Asset memory assetA = lockBox.assetA;
        Asset memory assetB = lockBox.assetB;

        if(block.timestamp >= lockBox.expiryTime){
            revert LockBox__EXPIRED();
        }

        if(lockBox.status != Status.PENDING){
            revert LockBox__NOT_AVAILABLE();
        }

    
        if(assetB.assetType == AssetType.NFT) {
            IERC721(assetB.assetAddress).transferFrom(msg.sender, lockBox.owner, assetB.assetID);
        }
        else if(assetB.assetType == AssetType.ERC1155) {
            IERC1155(assetB.assetAddress).safeTransferFrom(msg.sender, lockBox.owner, assetB.assetID, assetB.assetQuantity, "");
        }
        else if(assetB.assetType == AssetType.TOKEN) {
            IERC20(assetB.assetAddress).transferFrom(msg.sender, lockBox.owner, assetB.assetQuantity);
        }
        else if(assetB.assetType == AssetType.COIN) {
            if(msg.value < assetB.assetQuantity){
                revert LockBox__INSUFFICIENT_FUNDS_FOR_SWAP();
            }
            payable(lockBox.owner).transfer(assetB.assetQuantity);
            
        }

        
        if(assetA.assetType == AssetType.NFT) {
            IERC721(assetA.assetAddress).transferFrom(address(this), msg.sender, assetA.assetID);
        }
        else if(assetA.assetType == AssetType.ERC1155) {
            IERC1155(assetA.assetAddress).safeTransferFrom(address(this), msg.sender, assetA.assetID, assetA.assetQuantity, "");
        }
        else if(assetA.assetType == AssetType.TOKEN) {
            IERC20(assetA.assetAddress).transferFrom(address(this), msg.sender, assetA.assetQuantity);
        }
        else if(assetA.assetType == AssetType.COIN) {
            payable(msg.sender).transfer(assetA.assetQuantity);
        }

        s_lockBoxInfo[boxId].claimedBy = msg.sender;
        s_lockBoxInfo[boxId].status = Status.SUCCEED;
        

    }

    function cancelLockBox(uint256 boxId) public {

        LockBoxInfo memory lockBox = s_lockBoxInfo[boxId];
        Asset memory assetA = lockBox.assetA;


        require( msg.sender == lockBox.owner, "Already claimed by someone");
        require( lockBox.claimedBy == address(0), "Already claimed by someone");


        if(assetA.assetType == AssetType.NFT) {
            IERC721(assetA.assetAddress).transferFrom(address(this), lockBox.owner, assetA.assetID);
        }
        else if(assetA.assetType == AssetType.ERC1155) {
            IERC1155(assetA.assetAddress).safeTransferFrom(address(this), lockBox.owner, assetA.assetID, assetA.assetQuantity, "");
        }
        else if(assetA.assetType == AssetType.TOKEN) {
            IERC20(assetA.assetAddress).transferFrom(address(this), lockBox.owner, assetA.assetQuantity);
        }
        else if(assetA.assetType == AssetType.COIN) {
            payable(lockBox.owner).transfer(assetA.assetQuantity);
        }

        s_lockBoxInfo[boxId].status = Status.CANCELLED;

    }


    /* Getters */
    function getLockBoxCount() public view returns(uint) {
        return s_counter;
    }

    function getLockBoxInfo(uint256 boxId) public view returns(LockBoxInfo memory) {
        return s_lockBoxInfo[boxId];
    }

    function getLockBoxesInfo(uint256 from, uint256 count) public view returns(LockBoxInfo[] memory) {

        if (from > s_counter) {
            revert LockBox__OUT_OF_BOUND_REQUEST();
        }

        if (count > from) {
            count = from;
        }

        uint256 to = from - count;

        uint256 index = 0;
        LockBoxInfo[] memory lockBoxes = new LockBoxInfo[](count);
        
        for (uint256 i = from; i > to; i--) {
            lockBoxes[index] = s_lockBoxInfo[i];
            index++;
        }

        return lockBoxes;

    }

    function getLockBoxFee() public view returns(uint) {
        return s_boxFee;
    }


    /* Only owner */
    function withdrawFunds() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Balance is zero");
        payable(owner()).transfer(balance);
    }

    function updateBoxFee(uint _fee) public onlyOwner {
        s_boxFee = _fee;
    }

}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LockBox is Ownable {

    uint public counter;
    uint public boxFee = 0.1 ether;

    mapping (uint => LockBoxInfo) public lockBoxInfo;

    enum AssetType {NFT, TOKEN, COIN}
    enum Status {PENDING, SUCCEED, FAILED}
    enum ClaimStatus {NOT_CLAIMED, CLAIMED}
    enum LockStatus {NOT_LOCKED, LOCKED}
    enum ApprovalStatus {NOT_APPROVED, APPROVED}

    modifier onlyLockboxUsers(uint _id) {
        require(_msgSender() == lockBoxInfo[_id].assetA.owner || _msgSender() == lockBoxInfo[_id].assetB.owner, "Not allowed");
        _;
    }

    modifier onlyLockboxOwner(uint _id) {
        require(_msgSender() == lockBoxInfo[_id].lockBoxOwner, "Not allowed");
        _;
    }

    modifier isLockBoxValid(uint _id){
        require(lockBoxInfo[_id].status == Status.PENDING, "LockBox is not pending anymore");
        require( block.timestamp < lockBoxInfo[_id].expiryTime, "lockbox is expired"  );
        _;
    }

    struct Asset {
        AssetType assetType;
        address owner;
        address assetAddress;
        uint assetID;
        uint assetQuantity;
        LockStatus lockStatus;
        ApprovalStatus approvalStatus;
        ClaimStatus claimStatus;
        address claimedBy;
    }

    struct LockBoxInfo {
        address lockBoxOwner;
        uint expiryTime;
        Status status;
        Asset assetA;
        Asset assetB;
    }

    function createLockBox(
        AssetType _assetAtype, address _assetAaddress, uint _assetAID, uint _assetAQuantity,
        AssetType _assetBtype, address _assetBaddress, uint _assetBID, uint _assetBQuantity,
        uint _expiryTime
        ) public payable {
        
        require(msg.value >= boxFee, "Please pay the fee");
        require(
            _expiryTime > 0 && 
            _expiryTime <= 1 days, 
            "Expiry time should be more than now and less than one day"
            );

        counter++;

        Asset memory _assetA = Asset (
            _assetAtype, 
            msg.sender,
            _assetAaddress,
            _assetAID,
            _assetAQuantity,
            LockStatus.NOT_LOCKED,
            ApprovalStatus.NOT_APPROVED,
            ClaimStatus.NOT_CLAIMED,
            address(0)
        );

        Asset memory _assetB = Asset (
            _assetBtype, 
            address(0),
            _assetBaddress,
            _assetBID,
            _assetBQuantity,
            LockStatus.NOT_LOCKED,
            ApprovalStatus.NOT_APPROVED,
            ClaimStatus.NOT_CLAIMED,
            address(0)
        );

        LockBoxInfo memory _lockBox =  LockBoxInfo (
            msg.sender,
            block.timestamp + _expiryTime,
            Status.PENDING,
            _assetA,
            _assetB
        );


        lockBoxInfo[counter] = _lockBox;
    
    }

    function lockAsset(uint _id) public payable isLockBoxValid(_id){

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        
        if(msg.sender == _lockBox.assetA.owner){
            require(_lockBox.assetA.lockStatus == LockStatus.NOT_LOCKED, "Asset is already locked" );

                    // Submit Asset A
            if(_lockBox.assetA.assetType == AssetType.NFT) {
                IERC721(_lockBox.assetA.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetA.assetID);
                lockBoxInfo[_id].assetA.lockStatus = LockStatus.LOCKED;
            }
            else if(_lockBox.assetA.assetType == AssetType.TOKEN) {
                IERC20(_lockBox.assetA.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetA.assetQuantity);
                lockBoxInfo[_id].assetA.lockStatus = LockStatus.LOCKED;

            }
            else if(_lockBox.assetA.assetType == AssetType.COIN) {
                require(msg.value >= _lockBox.assetA.assetQuantity, "Insufficient locking funds" );
                lockBoxInfo[_id].assetA.lockStatus = LockStatus.LOCKED;
            }
        }

        else {
            require(_lockBox.assetB.lockStatus == LockStatus.NOT_LOCKED, "Asset is already locked" );

            lockBoxInfo[_id].assetB.owner = msg.sender;


            if(_lockBox.assetB.assetType == AssetType.NFT) {
                IERC721(_lockBox.assetB.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetB.assetID);
                lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;
            }
            else if(_lockBox.assetB.assetType == AssetType.TOKEN) {
                IERC20(_lockBox.assetB.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetB.assetQuantity);
                lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;

            }
            else if(_lockBox.assetB.assetType == AssetType.COIN) {
                require(msg.value >= _lockBox.assetB.assetQuantity, "Insufficient locking funds" );
                lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;
            }

        }
            

    }

    function approveAsset(uint _id) public onlyLockboxUsers(_id) isLockBoxValid(_id){

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        
        if(msg.sender == _lockBox.assetA.owner){
            
            require(_lockBox.assetA.lockStatus == LockStatus.LOCKED, "Asset id not locked" );
            require(_lockBox.assetA.approvalStatus == ApprovalStatus.NOT_APPROVED, "Asset is already approved");
            
            lockBoxInfo[_id].assetA.approvalStatus = ApprovalStatus.APPROVED;

            if(_lockBox.assetB.approvalStatus == ApprovalStatus.APPROVED){
                lockBoxInfo[_id].status = Status.SUCCEED;
            }

        }

        else if(msg.sender == _lockBox.assetB.owner){

            require(_lockBox.assetB.lockStatus == LockStatus.LOCKED, "Asset id not locked" );
            require(_lockBox.assetB.approvalStatus == ApprovalStatus.NOT_APPROVED, "Asset is already approved");
            
            lockBoxInfo[_id].assetB.approvalStatus = ApprovalStatus.APPROVED;

            if(_lockBox.assetA.approvalStatus == ApprovalStatus.APPROVED){
                lockBoxInfo[_id].status = Status.SUCCEED;
            }
        }


        
    }
    
    function claimAsset(uint _id) public  onlyLockboxUsers(_id) {

        if(block.timestamp >= lockBoxInfo[_id].expiryTime){
            lockBoxInfo[_id].status = Status.FAILED;
        }

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];

        require( _lockBox.status != Status.PENDING, "Nothing to claim" );

        if(msg.sender == _lockBox.assetA.owner) {

            if(_lockBox.status == Status.SUCCEED){
                // require( _lockBox.assetB.claimStatus == ClaimStatus.NOT_CLAIMED, "Asset B is already claimed" );
                // require( _lockBox.assetB.lockStatus == LockStatus.LOCKED, "Asset B is not locked" );
                // require( _lockBox.assetB.approvalStatus == ApprovalStatus.APPROVED, "Asset B is not approved" );

                lockBoxInfo[_id].assetB.claimedBy = msg.sender;
                lockBoxInfo[_id].assetB.claimStatus = ClaimStatus.CLAIMED;

                if(_lockBox.assetB.assetType == AssetType.NFT) {
                    IERC721(_lockBox.assetB.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetB.assetID);
                }
                else if(_lockBox.assetB.assetType == AssetType.TOKEN) {
                    IERC20(_lockBox.assetB.assetAddress).transfer(msg.sender, _lockBox.assetB.assetQuantity);
                }
                else if(_lockBox.assetB.assetType == AssetType.COIN) {
                    payable(_lockBox.assetA.owner).transfer(_lockBox.assetB.assetQuantity);
                }
            }

            else if(_lockBox.status == Status.FAILED){
                
                require( _lockBox.assetA.lockStatus == LockStatus.LOCKED, "Asset A is not locked" );
                require( _lockBox.assetA.claimStatus == ClaimStatus.NOT_CLAIMED, "Asset A is already claimed" );
                // require( _lockBox.assetA.approvalStatus == ApprovalStatus.APPROVED, "Asset A is not approved" );
    
                lockBoxInfo[_id].assetA.claimedBy = msg.sender;
                lockBoxInfo[_id].assetA.claimStatus = ClaimStatus.CLAIMED;

                if(_lockBox.assetA.assetType == AssetType.NFT) {
                    IERC721(_lockBox.assetA.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetA.assetID);
                }
                else if(_lockBox.assetA.assetType == AssetType.TOKEN) {
                    IERC20(_lockBox.assetA.assetAddress).transfer(msg.sender, _lockBox.assetA.assetQuantity);
                }

            }

            else if(_lockBox.status == Status.PENDING) {
                require( _lockBox.assetA.lockStatus == LockStatus.LOCKED, "Asset A is not locked" );

            }

        }

        else if(msg.sender == _lockBox.assetB.owner) {
            
            if(_lockBox.status == Status.SUCCEED) {
                
                // require( _lockBox.assetA.claimStatus == ClaimStatus.NOT_CLAIMED, "Asset A is already claimed" );
                // require( _lockBox.assetA.lockStatus == LockStatus.LOCKED, "Asset A is not locked" );
                // require( _lockBox.assetA.approvalStatus == ApprovalStatus.APPROVED, "Asset A is not approved" );

                lockBoxInfo[_id].assetA.claimedBy = msg.sender;
                lockBoxInfo[_id].assetA.claimStatus = ClaimStatus.CLAIMED;

                if(_lockBox.assetA.assetType == AssetType.NFT) {
                    IERC721(_lockBox.assetA.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetA.assetID);
                }
                else if(_lockBox.assetA.assetType == AssetType.TOKEN) {
                    IERC20(_lockBox.assetA.assetAddress).transfer(msg.sender, _lockBox.assetA.assetQuantity);
                }
                else if(_lockBox.assetA.assetType == AssetType.COIN) {
                    payable(_lockBox.assetB.owner).transfer(_lockBox.assetA.assetQuantity);
                }

            }

            else if(_lockBox.status == Status.FAILED) {

                require( _lockBox.assetB.claimStatus == ClaimStatus.NOT_CLAIMED, "Asset B is already claimed" );
                require( _lockBox.assetB.lockStatus == LockStatus.LOCKED, "Asset B is not locked" );

                lockBoxInfo[_id].assetB.claimStatus = ClaimStatus.CLAIMED;
                lockBoxInfo[_id].assetB.claimedBy = msg.sender;

                if(_lockBox.assetB.assetType == AssetType.NFT) {
                    IERC721(_lockBox.assetB.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetB.assetID);
                }
                else if(_lockBox.assetB.assetType == AssetType.TOKEN) {
                    IERC20(_lockBox.assetB.assetAddress).transfer(msg.sender, _lockBox.assetB.assetQuantity);
                }
                else if(_lockBox.assetB.assetType == AssetType.COIN) {
                    payable(_lockBox.assetB.owner).transfer(_lockBox.assetB.assetQuantity);
                }

            }

        }


    }

    function cancelLockBox(uint _id) public onlyLockboxOwner(_id) isLockBoxValid(_id) {
        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
                
        require(
            _lockBox.assetA.approvalStatus == ApprovalStatus.NOT_APPROVED ||
            _lockBox.assetB.approvalStatus == ApprovalStatus.NOT_APPROVED ,
             "Cannot cancel the lockbox now"
        );

        lockBoxInfo[_id].status = Status.FAILED;

    }

    function withdrawFunds() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Balance is zero");
        payable(owner()).transfer(balance);
    }

    function updateBoxFee(uint _fee) public onlyOwner {
        require(_fee > 0, "should be more than zero");
        boxFee = _fee;
    }





}
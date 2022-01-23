// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './IERC20.sol';
import './IERC721.sol';
import './ERC721Holder.sol';


contract LockBox is ERC721Holder {

    uint public counter;
    uint boxFee = 0.1 ether;
    uint updateFee = 0.000001 ether;

    mapping (uint => LockBoxInfo) public lockBoxInfo;

    enum AssetNumber {ONE,TWO}
    enum AssetType {NFT, TOKEN, COIN}
    enum Status {PENDING, SUCCEED}
    enum ClaimStatus {NOT_CLAIMED, CLAIMED}
    enum LockStatus {NOT_LOCKED, LOCKED}
    enum ApprovalStatus {NOT_APPROVED, APPROVED}

    modifier onlyOwner(uint _id) {
        require(msg.sender == lockBoxInfo[_id].lockBoxOwner);
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
    }

    struct LockBoxInfo {
        address lockBoxOwner;
        uint expiryTime;
        // uint lockBoxWallet;
        Status status;
        Asset assetA;
        Asset assetB;
    }


    function CreateLockBox(
        AssetType _assetAtype, address _assetAaddress, uint _assetAID, uint _assetAQuantity,
        AssetType _assetBtype, address _assetBaddress, uint _assetBID, uint _assetBQuantity,
        uint _expiryTime
        ) public payable {
        
        require(msg.value >= boxFee, "Please pay the fee");

        counter++;

        Asset memory _assetA = Asset(
            _assetAtype, 
            msg.sender,
            _assetAaddress,
            _assetAID,
            _assetAQuantity,
            LockStatus.NOT_LOCKED,
            ApprovalStatus.NOT_APPROVED,
            ClaimStatus.NOT_CLAIMED
        );

        Asset memory _assetB = Asset(
            _assetBtype, 
            address(0),
            _assetBaddress,
            _assetBID,
            _assetBQuantity,
            LockStatus.NOT_LOCKED,
            ApprovalStatus.NOT_APPROVED,
            ClaimStatus.NOT_CLAIMED
        );

        LockBoxInfo memory _lockBox =  LockBoxInfo(
            msg.sender,
            _expiryTime,
            Status.PENDING,
            _assetA,
            _assetB
        );


        lockBoxInfo[counter] = _lockBox;
    
    }

    function LockAssetA(uint _id) public payable {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        require(msg.sender == _lockBox.lockBoxOwner);
        require( block.timestamp < _lockBox.expiryTime );

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
            require(msg.value >= _lockBox.assetA.assetQuantity);
            // lockBoxInfo[_id].lockBoxWallet += msg.value;
            lockBoxInfo[_id].assetA.lockStatus = LockStatus.LOCKED;
        }


    }

    function LockAssetB(uint _id) public payable {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        require( block.timestamp < _lockBox.expiryTime );
        
        // Submit Asset B
        if(_lockBox.assetB.assetType == AssetType.NFT) {
            IERC721(_lockBox.assetB.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetB.assetID);
            lockBoxInfo[_id].assetB.owner = msg.sender;
            lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;
        }
        else if(_lockBox.assetB.assetType == AssetType.TOKEN) {
            IERC20(_lockBox.assetB.assetAddress).transferFrom(msg.sender, address(this), _lockBox.assetB.assetQuantity);
            lockBoxInfo[_id].assetB.owner = msg.sender;
            lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;

        }
        else if(_lockBox.assetB.assetType == AssetType.COIN) {
            require(msg.value >= _lockBox.assetB.assetQuantity);
            // lockBoxInfo[_id].lockBoxWallet += msg.value;
            lockBoxInfo[_id].assetB.owner = msg.sender;
            lockBoxInfo[_id].assetB.lockStatus = LockStatus.LOCKED;
        }



    } 


    function ApproveAssetA(uint _id) public {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];

        require(_lockBox.assetA.lockStatus == LockStatus.LOCKED );
        require(_lockBox.assetA.approvalStatus == ApprovalStatus.NOT_APPROVED);
        
        require(msg.sender == _lockBox.lockBoxOwner);

        require( block.timestamp < _lockBox.expiryTime);
        lockBoxInfo[_id].assetA.approvalStatus = ApprovalStatus.APPROVED;

        if(_lockBox.assetB.approvalStatus == ApprovalStatus.APPROVED){
            lockBoxInfo[_id].status = Status.SUCCEED;
        }
        
    }

    function ApproveAssetB(uint _id) public {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        require(msg.sender == _lockBox.assetB.owner);

        require(_lockBox.assetB.lockStatus == LockStatus.LOCKED );
        require(_lockBox.assetB.approvalStatus == ApprovalStatus.NOT_APPROVED);

        require( block.timestamp < _lockBox.expiryTime );
        lockBoxInfo[_id].assetB.approvalStatus = ApprovalStatus.APPROVED;

        if(_lockBox.assetA.approvalStatus == ApprovalStatus.APPROVED){
            lockBoxInfo[_id].status = Status.SUCCEED;
        }

    }


    function ClaimAssetA(uint _id) public  {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        require(msg.sender == _lockBox.assetB.owner);
        require( _lockBox.status == Status.SUCCEED );
        require( _lockBox.assetA.claimStatus == ClaimStatus.NOT_CLAIMED );

        // Claim Asset A
        if(_lockBox.assetA.assetType == AssetType.NFT) {
            // IERC721(_lockBox.assetA.assetAddress).approve(msg.sender, _lockBox.assetA.assetID);
            IERC721(_lockBox.assetA.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetA.assetID);
        }
        else if(_lockBox.assetA.assetType == AssetType.TOKEN) {
            IERC20(_lockBox.assetA.assetAddress).transfer(msg.sender, _lockBox.assetA.assetQuantity);
        }
        else if(_lockBox.assetA.assetType == AssetType.COIN) {
            payable(_lockBox.assetB.owner).transfer(_lockBox.assetA.assetQuantity);
        }

        lockBoxInfo[_id].assetA.claimStatus = ClaimStatus.CLAIMED;

    }


    function ClaimAssetB(uint _id) public  {

        LockBoxInfo memory _lockBox = lockBoxInfo[_id];
        require(msg.sender == _lockBox.assetA.owner);
        require( _lockBox.status == Status.SUCCEED );
        require( _lockBox.assetB.claimStatus == ClaimStatus.NOT_CLAIMED );

        // Claim Asset B
        if( _lockBox.assetB.assetType == AssetType.NFT ) {
            IERC721(_lockBox.assetB.assetAddress).approve(msg.sender, _lockBox.assetB.assetID);
            IERC721(_lockBox.assetB.assetAddress).transferFrom(address(this), msg.sender, _lockBox.assetB.assetID);
            // lockBoxInfo[_id].assetA.lockStatus = LockStatus.LOCKED;
        }
        else if( _lockBox.assetB.assetType == AssetType.TOKEN ) {
            IERC20(_lockBox.assetB.assetAddress).transfer(msg.sender, _lockBox.assetB.assetQuantity);
        }
        else if( _lockBox.assetB.assetType == AssetType.COIN ) {
            payable(_lockBox.assetA.owner).transfer(_lockBox.assetB.assetQuantity);
        }

        lockBoxInfo[_id].assetB.claimStatus = ClaimStatus.CLAIMED;
    
    }
    



}
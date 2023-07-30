import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { ethers, Contract } from "ethers";
import { LockBox } from './typechain';
import { useEthers, shortenAddress } from '@usedapp/core'
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { LockBoxTestNFT, LockBoxTestTokens, TestERC1155 } from './typechain';
import Chip from '@mui/material/Chip';
import { OnlinePredictionSharp } from '@mui/icons-material';
// import Countdown from 'react-countdown';
import { useDispatch, useSelector } from 'react-redux';
import {Asset, Box, addBoxData, DataType, setLockerMasterMethods, updateLockedAsset, updateApprovedAsset, updateClaimedAsset} from './store'


const lockboxABI = require("./abis/LockBox.json");

// type Asset = {
//     assetType: number,
//     owner: string,
//     // ownedByYou: boolean,
//     assetAddress: string,
//     assetID: number,
//     assetQuantity: number,
//     lockStatus: number,
//     approvalStatus: number,
//     claimStatus: number,
//     claimedBy: string,
//     boxId: number
// }

// type Box = {
//     boxId: number,
//     assetA: Asset,
//     assetB: Asset,
//     expiryTime: number,
//     lockBoxOwner: string,
//     status: number
// }

const lockBoxAddress = "0x1048b143c05eE8218Ed9954C23b15436073Ec694";
const TestNFT = require("./abis/LockBoxTestNFT.json");
const TestToken = require("./abis/LockBoxTestTokens.json");
const ERC1155Token = require("./abis/TestERC1155.json");


const AllBoxes = () => {
    const dispatch = useDispatch();
    const { lockBoxData , masterContracts} = useSelector((state: DataType) => state);
    
    console.log("lockBoxData ", lockBoxData)
    console.log("masterContracts ", masterContracts)
    
    const classes = useStyles();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { active, chainId, activateBrowserWallet, account } = useEthers();

    useEffect(() => {
        console.log("trying   ")
        fatchBlockChainData();
    }, [])

    const fatchBlockChainData = async () => {
        const loxkBoxContract = new ethers.Contract(
            lockBoxAddress,
            lockboxABI.abi,
            provider) as LockBox

        dispatch(addBoxData(null));
        dispatch(setLockerMasterMethods(loxkBoxContract));        

        setLockerMasterMethods
        let boxes = Number(await loxkBoxContract.counter());
        console.log("boxes", boxes)

        for (let i = boxes; i > 0; i--) {

            const boxInfo = await loxkBoxContract.lockBoxInfo(i);

            const assetA: Asset = {
                assetType: Number(boxInfo.assetA.assetType),
                owner: boxInfo.assetA.owner,
                // ownedByYou: account ? boxInfo.assetA.owner === account : false,
                assetAddress: boxInfo.assetA.assetAddress,
                assetID: Number(boxInfo.assetA.assetID),
                assetQuantity: Number(boxInfo.assetA.assetQuantity),
                lockStatus: Number(boxInfo.assetA.lockStatus),
                approvalStatus: Number(boxInfo.assetA.approvalStatus),
                claimStatus: Number(boxInfo.assetA.claimStatus),
                claimedBy: boxInfo.assetA.claimedBy,
                boxId: i,

            }
            const assetB = {
                assetType: Number(boxInfo.assetB.assetType),
                owner: boxInfo.assetB.owner,
                // ownedByYou: account ? boxInfo.assetB.owner === account : false,
                assetAddress: boxInfo.assetB.assetAddress,
                assetID: Number(boxInfo.assetB.assetID),
                assetQuantity: Number(boxInfo.assetB.assetQuantity),
                lockStatus: Number(boxInfo.assetB.lockStatus),
                approvalStatus: Number(boxInfo.assetB.approvalStatus),
                claimStatus: Number(boxInfo.assetB.claimStatus),
                claimedBy: boxInfo.assetB.claimedBy,
                boxId: i,

            }
            const box: Box = {
                boxId: i,
                assetA,
                assetB,
                expiryTime: Number(boxInfo.expiryTime),
                lockBoxOwner: boxInfo.lockBoxOwner,
                status: boxInfo.status
            }

            dispatch(addBoxData(box))

        }

    }

    const renderer = ({ hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return (
                <Chip label="Expired" sx={{ bgcolor: "#f54646", height: "16px", fontSize: 10 }} />
            )
        } else {
            return <span>{hours}:{minutes}:{seconds}</span>;
        }
    };

    const getTime = (time: number) => {
        const newDate = new Date(time * 1000).toLocaleDateString();
        const newTime = new Date(time * 1000).toLocaleTimeString();
        const newww = `Date: ${newDate}, Time: ${newTime}`

        // console.log("Date ", new Date(time * 1000).getTime())
        // console.log("Date ", Date.now())
        return (
            <div />
            // <Countdown
            //     date={new Date(time * 1000).getTime()}
            //     renderer={renderer}
            // />
        )

    }

    const getAssettype = (type: number) => {
        if (type === 0) {
            return "NFT"
        }
        else if (type === 1) {
            return "ERC20"
        }
        else if (type === 3) {
            return "ERC1155"
        }
        else if (type === 2) {
            return "Ethers"
        }
        else {
            return ""
        }

    }

    const getLockedStatus = (stauts: number) => {
        if (stauts === 0) {
            // return "Not Locked"
            return <Chip label="Not Locked" sx={{ bgcolor: "#f54646", height: "16px", fontSize: 10 }} />
        }
        else if (stauts === 1) {
            // return "Locked"
            return <Chip label="Locked" sx={{ bgcolor: "#5ff077", height: "16px", fontSize: 10 }} />
        }
        else {
            return ""
        }

    }

    const getApprovalStatus = (stauts: number) => {
        if (stauts === 0) {
            // return "Not Approved"
            return <Chip label="Not Approved" sx={{ bgcolor: "#f54646", height: "16px", fontSize: 10 }} />
        }
        else if (stauts === 1) {
            // return "Approved"
            return <Chip label="Approved" sx={{ bgcolor: "#5ff077", height: "16px", fontSize: 10 }} />
        }
        else {
            return ""
        }
    }

    const getClaimStatus = (stauts: number) => {
        if (stauts === 0) {
            // return "Not Claimed"
            return <Chip label="Not Claimed" sx={{ bgcolor: "#f54646", height: "16px", fontSize: 10 }} />
        }
        else if (stauts === 1) {
            // return "Claimed"
            return <Chip label="Claimed" sx={{ bgcolor: "#5ff077", height: "16px", fontSize: 10 }} />
        }
        else {
            return ""
        }
    }

    const getAssetQuantity = (type: number, quantity: number) => {
        if (type === 0) {
            return quantity.toString()
        }
        else if (type === 1) {
            return `${ethers.utils.formatEther(quantity.toString())} Tokens`
        }
        else if (type === 3) {
            return quantity.toString()
        }
        else if (type === 2) {
            return `${ethers.utils.formatEther(quantity.toString())} ETH`
        }
        else {
            return ""
        }
    }

    const cancelBox = async () => {
        alert("canceling the box")
    }

    const getBoxStatus = (status: number) => {
        if(status === 0){
            // return "InProgress";
            return <Chip label="InProgress" sx={{ bgcolor: "#c1cfc4", height: "16px", fontSize: 10 }} />
        }
        else if(status === 1){
            // return "Successful";
            return <Chip label="Successful" sx={{ bgcolor: "#5ff077", height: "16px", fontSize: 10 }} />
        }
        else if(status === 2) {
            // return "Failed"
            return <Chip label="Unsuccessful" sx={{ bgcolor: "#f54646", height: "16px", fontSize: 10 }} />
        }
    }
    // const approveToLocker = async (asset: Asset) => {


    // }

    const lockAsset = async (boxID: number, type: "A"|"B", asset: Asset) => {
        
        const signer = provider.getSigner()
        const LockTx = masterContracts.lockBoxMethods?.connect(signer);

        const assetType = Number(asset.assetType);

        if (assetType === 0 && account) {
            const NFTContract = new ethers.Contract(asset.assetAddress, TestNFT.abi, provider) as LockBoxTestNFT
            const getApproved = await NFTContract.getApproved(asset.assetID)

            if (getApproved !== lockBoxAddress) {
                const confirmation = window.confirm("You have to approve this asset so lockbox can transfer its ownership")
                if (confirmation) {
                    const ArrpveTx = NFTContract?.connect(signer);
                    try {
                        const tx = await ArrpveTx.approve(lockBoxAddress, asset.assetID);
                        await tx.wait();

                        try {
                            const tx2 = await LockTx?.lockAsset(asset.boxId);
                            const reciept2 = await tx2?.wait();
                            console.log("reciept2 ", reciept2)
                            dispatch(updateLockedAsset({boxID, type, asset }))


                        }
                        catch (e: any) {
                            alert(e.data.message)
                        }
                    }
                    catch (e: any) {
                        alert(e.data.message)
                    }

                }

            }

            else if (getApproved === lockBoxAddress) {
                try {
                    const tx2 = await LockTx?.lockAsset(asset.boxId);
                    const reciept2 = await tx2?.wait();
                    console.log("reciept2 ", reciept2)
                    dispatch(updateLockedAsset({boxID, type, asset }))

                }
                catch (e: any) {
                    alert(e.data.message)
                }

            }
        }

        else if (assetType === 1 && account) {
            const TokenContract = new ethers.Contract(asset.assetAddress, TestToken.abi, provider) as LockBoxTestTokens
            const allowance = await TokenContract.allowance(asset.owner, lockBoxAddress);
            console.log("allowance to Locker ", Number(allowance))
            console.log("asset.assetQuantity ", Number(asset.assetQuantity))
            if (Number(allowance) < Number(asset.assetQuantity)) {
                const confirmation = window.confirm("You have to approve this asset so lockbox can transfer its ownership")
                if (confirmation) {
                    const ArrpveTx = TokenContract?.connect(signer);
                    try {
                        const tx = await ArrpveTx.approve(lockBoxAddress, asset.assetQuantity.toString());
                        await tx.wait();

                        try {
                            const tx2 = await LockTx?.lockAsset(asset.boxId);
                            const reciept2 = await tx2?.wait();
                            console.log("reciept2 ", reciept2);
                            dispatch(updateLockedAsset({boxID, type, asset }))

                        }
                        catch (e: any) {
                            console.log(e)
                            alert(e.data.message)
                        }
                    }
                    catch (e: any) {
                        console.log(e)
                        alert(e.data.message)
                    }

                }

            }

            else if (Number(allowance) >= Number(asset.assetQuantity)) {
                try {
                    const tx2 = await LockTx?.lockAsset(asset.boxId);
                    const reciept2 = await tx2?.wait();
                    console.log("reciept2 ", reciept2);
                    dispatch(updateLockedAsset({boxID, type, asset }))

                }
                catch (e: any) {
                    alert(e.data.message)
                }

            }

        }

        else if (assetType === 3 && account) {
            const ERC1155Contract = new ethers.Contract(asset.assetAddress, ERC1155Token.abi, provider) as TestERC1155
            // console.log("ERC1155 Contract ", ERC1155Contract)
            // console.log("ERC1155 asset.assetAddress ", asset.assetAddress)
            // console.log("ERC1155 account ", account)
            // console.log("ERC1155 lockBoxAddress ", lockBoxAddress)
            const isApprovedForAll = await ERC1155Contract.isApprovedForAll(account, lockBoxAddress);
            // console.log("ERC1155 isApprovedForAll", isApprovedForAll)

            if (!isApprovedForAll) {
                const confirmation = window.confirm("You have to approve this asset so lockbox can transfer its ownership")
                if (confirmation) {
                    const ArrpveTx = ERC1155Contract?.connect(signer);
                    try {
                        const tx = await ArrpveTx.setApprovalForAll(lockBoxAddress, true);
                        await tx.wait();

                        try {
                            const tx2 = await LockTx?.lockAsset(asset.boxId);
                            const reciept2 = await tx2?.wait();
                            console.log("reciept2 ", reciept2)
                            dispatch(updateLockedAsset({boxID, type, asset }))


                        }
                        catch (e: any) {
                            console.log(e.data.message)
                            alert(e.data.message)
                        }
                    }
                    catch (e: any) {
                        alert(e.data.message)
                    }

                }

            }

            else if (isApprovedForAll) {
                try {
                    const tx2 = await LockTx?.lockAsset(asset.boxId);
                    const reciept2 = await tx2?.wait();
                    console.log("reciept2 ", reciept2)
                    dispatch(updateLockedAsset({boxID, type, asset }))

                }
                catch (e: any) {
                    alert(e.data.message)
                }

            }
        }

        else if (assetType === 2 && account) {
            try {
                const option = { value: asset.assetQuantity.toString() }
                const tx = await LockTx?.lockAsset(asset.boxId, option)
                const reciept = await tx?.wait()
                console.log(reciept)
                dispatch(updateLockedAsset({boxID, type, asset }))

            }
            catch (e: any) {
                alert(e.data.message)
                // console.log(e)
            }
        }
        
        // fatchBlockChainData();

    }

    const approveAsset = async (boxID: number, type: "A"|"B", asset: Asset) => {
        const signer = provider.getSigner()
        const LockTx = masterContracts.lockBoxMethods?.connect(signer);

        try {
            // const option = {value: asset.assetQuantity.toString()}
            const tx = await LockTx?.approveAsset(asset.boxId)
            const reciept = await tx?.wait()
            console.log(reciept)
            dispatch(updateApprovedAsset({boxID, type, asset }))
        }
        catch (e: any) {
            alert(e.data.message)
            // console.log(e)
        }


    }

    const claimAsset = async (boxID: number, type: "A"|"B", asset: Asset) => {
        const signer = provider.getSigner()
        const LockTx = masterContracts.lockBoxMethods?.connect(signer);

        try {
            const tx = await LockTx?.claimAsset(asset.boxId)
            const reciept = await tx?.wait()
            console.log(reciept);
            dispatch(updateClaimedAsset({boxID, type, asset }))

        }
        catch (e: any) {
            alert(e.data.message)
            // console.log(e)
        }
    }


    return (
        <div className={classes.container}>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                AllBoxes
            </div>

            {
                lockBoxData && lockBoxData.map((box) => {
                    return (
                        <div key={box.boxId} className={classes.box}>

                            <div className={classes.boxheader}>
                                <div> Box ID: {box.boxId} </div>
                                <div> Status: {getBoxStatus(box.status)} </div>
                                <div> Owner: {shortenAddress(box.lockBoxOwner)} </div>
                                <div> Expiry time: {getTime(box.expiryTime)} </div>
                            </div>

                            <div className={classes.boxInfo}>

                                <div className={classes.assetContainer}>
                                    <div style={{ border: "0px solid black", textAlign: "center" }}> Asset A</div>
                                    <div className={classes.assetInfo}>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Type:</div>
                                            <div>{getAssettype(box.assetA.assetType)}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Quantity:</div>
                                            <div>{getAssetQuantity(box.assetA.assetType, box.assetA.assetQuantity)}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset ID:</div>
                                            <div>{box.assetA.assetID}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Address:</div>
                                            <Tooltip title={`${box.assetA.assetAddress}`}>
                                                <div>
                                                    {shortenAddress(box.assetA.assetAddress)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Owner:</div>
                                            <Tooltip title={`${box.assetA.owner}`}>
                                                <div>
                                                    {shortenAddress(box.assetA.owner)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Owned by you:</div>
                                            <div>
                                                {
                                                    !account ?
                                                        <div>
                                                            <Chip
                                                                label="Connect Wallet"
                                                                onClick={() => activateBrowserWallet()}
                                                                sx={{ bgcolor: "#adaaaa", height: "16px" }}
                                                            />
                                                        </div> :
                                                        account && box.assetA.owner === account ?
                                                            <div>
                                                                <Chip label="Yes" sx={{ bgcolor: "#98fa98", height: "16px" }} />
                                                            </div> :
                                                            <div>
                                                                <Chip label="No" sx={{ bgcolor: "#fc5a5a", height: "16px" }} />
                                                            </div>
                                                }
                                            </div>
                                        </div>

                                        <br />

                                        <div className={classes.assetInfoSub}>
                                            <div>Locked in box:</div>
                                            <div>{getLockedStatus(box.assetA.lockStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Approved to trade:</div>
                                            <div>{getApprovalStatus(box.assetA.approvalStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Claimed:</div>
                                            <div>{getClaimStatus(box.assetA.claimStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Claime By:</div>
                                            <Tooltip title={`${box.assetA.claimedBy}`}>
                                                <div>
                                                    {shortenAddress(box.assetA.claimedBy)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <br />

                                        {
                                            box.assetA.lockStatus === 0 && box.assetA.approvalStatus === 0 && box.assetA.claimStatus === 0 ?
                                                <div className={classes.controls}>
                                                    <Button
                                                        onClick={() => lockAsset(box.boxId, "A", box.assetA)}
                                                        size="small"
                                                        variant='contained'
                                                        sx={{ borderRadius: 0 }}
                                                    >
                                                        Lock
                                                    </Button>
                                                </div> :
                                                box.assetA.lockStatus === 1 && box.assetA.approvalStatus === 0 && box.assetA.claimStatus === 0 ?
                                                    <div className={classes.controls}>
                                                        {/* <Button size="small" variant='contained' sx={{ borderRadius: 0 }}> Approve </Button> */}
                                                        <Button
                                                            onClick={() => approveAsset(box.boxId, "A", box.assetA)}
                                                            size="small"
                                                            variant='contained'
                                                            sx={{ borderRadius: 0 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </div> :
                                                    box.assetA.lockStatus === 1 && box.assetA.approvalStatus === 1 && box.assetA.claimStatus === 0 ?
                                                        <div className={classes.controls}>
                                                            {/* <Button size="small" variant='contained' sx={{ borderRadius: 0 }}> Claim </Button> */}
                                                            <Button
                                                                onClick={() => claimAsset(box.boxId, "A", box.assetA)}
                                                                size="small"
                                                                variant='contained'
                                                                sx={{ borderRadius: 0 }}
                                                            >
                                                                Claim
                                                            </Button>
                                                        </div> :
                                                        null
                                        }
                                    </div>

                                </div>

                                <div className={classes.assetContainer}>

                                    <div style={{ border: "0px solid black", textAlign: "center" }}> Asset B</div>

                                    <div className={classes.assetInfo}>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Type:</div>
                                            <div>{getAssettype(box.assetB.assetType)}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Quantity:</div>
                                            <div>{getAssetQuantity(box.assetB.assetType, box.assetB.assetQuantity)}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset ID:</div>
                                            <div>{box.assetB.assetID}</div>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Address:</div>
                                            <Tooltip title={`${box.assetB.assetAddress}`}>
                                                <div>
                                                    {shortenAddress(box.assetB.assetAddress)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Asset Owner:</div>
                                            <Tooltip title={`${box.assetB.owner}`}>
                                                <div>
                                                    {shortenAddress(box.assetB.owner)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <div className={classes.assetInfoSub}>
                                            <div>Owned by you:</div>
                                            <div>
                                                {
                                                    !account ?
                                                        <div>
                                                            <Chip
                                                                label="Connect Wallet"
                                                                onClick={() => activateBrowserWallet()}
                                                                sx={{ bgcolor: "#adaaaa", height: "16px" }}
                                                            />
                                                        </div> :
                                                        account && box.assetB.owner === account ?
                                                            <div>
                                                                <Chip label="Yes" sx={{ bgcolor: "#98fa98", height: "16px" }} />
                                                            </div> :
                                                            <div>
                                                                <Chip label="No" sx={{ bgcolor: "#fc5a5a", height: "16px" }} />
                                                            </div>
                                                }
                                            </div>
                                        </div>


                                        <br />

                                        <div className={classes.assetInfoSub}>
                                            <div>Locked in box:</div>
                                            <div>{getLockedStatus(box.assetB.lockStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Approved to trade:</div>
                                            <div>{getApprovalStatus(box.assetB.approvalStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Claimed:</div>
                                            <div>{getClaimStatus(box.assetB.claimStatus)}</div>
                                        </div>
                                        <div className={classes.assetInfoSub}>
                                            <div>Claime By:</div>
                                            <Tooltip title={`${box.assetB.claimedBy}`}>
                                                <div>
                                                    {shortenAddress(box.assetB.claimedBy)}
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <br />

                                        {
                                            box.assetB.lockStatus === 0 && box.assetB.approvalStatus === 0 && box.assetB.claimStatus === 0 ?
                                                <div className={classes.controls}>
                                                    {/* <Button size="small" variant='contained' sx={{ borderRadius: 0, marginRight: "10px" }}> Approve </Button> */}
                                                    {/* <Button size="small" variant='contained' sx={{ borderRadius: 0 }}> Lock </Button> */}
                                                    <Button
                                                        onClick={() => lockAsset(box.boxId, "B", box.assetB)}
                                                        size="small"
                                                        variant='contained'
                                                        sx={{ borderRadius: 0 }}
                                                    >
                                                        Lock
                                                    </Button>
                                                </div> :
                                                box.assetB.lockStatus === 1 && box.assetB.approvalStatus === 0 && box.assetB.claimStatus === 0 ?
                                                    <div className={classes.controls}>
                                                        <Button
                                                            onClick={() => approveAsset(box.boxId, "B", box.assetB)}
                                                            size="small"
                                                            variant='contained'
                                                            sx={{ borderRadius: 0 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </div> :
                                                    box.assetB.lockStatus === 1 && box.assetB.approvalStatus === 1 && box.assetB.claimStatus === 0 ?
                                                        <div className={classes.controls}>
                                                            <Button
                                                                onClick={() => claimAsset(box.boxId, "B", box.assetB)}
                                                                size="small"
                                                                variant='contained'
                                                                sx={{ borderRadius: 0 }}
                                                            >
                                                                Claim
                                                            </Button>
                                                        </div> :
                                                        null
                                        }
                                    </div>

                                </div>

                            </div>
                        </div>
                    )
                })
            }

        </div>
    )
};

export default AllBoxes;

const useStyles = makeStyles({
    container: {
        // border: "1px solid red",
        // height: "100%",
        maxHeight: "500px",
        overflow: "auto"
    },
    header: {
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "0px solid black",
        padding: "10px"

    },
    createABox: {
        border: "0px solid black",
        width: "50%"
    },
    allBoxes: {
        border: "0px solid black",
        width: "50%",
    },
    box: {
        borderBottom: "1px solid black",
        marginBottom: "10px",
        fontSize: "12px"
    },
    boxInfo: {
        borderBottom: "1px solid black",
        display: "flex",

    },
    boxheader: {
        padding: "5px",
        border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    assetInfo: {
        padding: "5px",
        paddingLeft: "10px",
        paddingRight: "10px",
    },
    assetInfoSub: {
        // border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

    },
    assetContainer: {
        padding: "10px",
        width: "50%"
    },
    controls: {
        // border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelBox: {
        // border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10px"

    }
});

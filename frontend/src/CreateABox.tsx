import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
// import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Button, CircularProgress } from '@mui/material';
import { ethers, Contract } from "ethers";
import { LockBox } from './typechain';
import { useEthers } from '@usedapp/core';
import { useDispatch, useSelector } from 'react-redux';
import { Asset, Box, createBoxData, DataType } from './store'

// import AdapterDateFns from '@mui/lab/AdapterDateFns';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
// import DateTimePicker from '@mui/lab/DateTimePicker';



const lockboxABI = require("./abis/LockBox.json")
const lockBoxAddress = "0x1048b143c05eE8218Ed9954C23b15436073Ec694";
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

type Asset_local = {
    assetType: null | number,
    assetID: null | number,
    assetQuantity: null | number,
    assetAddress: string

}

const CreateABox = () => {

    const dispatch = useDispatch();

    const { active, chainId, activateBrowserWallet, account } = useEthers();

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const classes = useStyles();

    const [loading, isLoading] = useState(false);

    const [asset1, setAsset1] = useState<Asset_local>({
        assetType: 4,
        assetID: 0,
        assetQuantity: 0,
        assetAddress: NULL_ADDRESS
    });

    const [asset2, setAsset2] = useState<Asset_local>({
        assetType: 4,
        assetID: 0,
        assetQuantity: 0,
        assetAddress: NULL_ADDRESS
    });

    const handleAssest1Change = (e: any, id: "type" | "id" | "quantity" | "address") => {
        if (id === "type") {
            setAsset1({ assetType: e, assetID: asset1.assetID, assetQuantity: asset1.assetQuantity, assetAddress: asset1.assetAddress })
        }
        else if (id === "id") {
            setAsset1({ assetType: asset1.assetType, assetID: e, assetQuantity: asset1.assetQuantity, assetAddress: asset1.assetAddress })
        }
        else if (id === "quantity") {
            setAsset1({ assetType: asset1.assetType, assetID: asset1.assetID, assetQuantity: e, assetAddress: asset1.assetAddress })
        }
        else if (id === "address") {
            setAsset1({ assetType: asset1.assetType, assetID: asset1.assetID, assetQuantity: asset1.assetQuantity, assetAddress: e })
        }
        // console.log(1)
    }

    const handleAssest2Change = (e: any, id: "type" | "id" | "quantity" | "address") => {
        if (id === "type") {
            setAsset2({ assetType: e, assetID: asset2.assetID, assetQuantity: asset2.assetQuantity, assetAddress: asset2.assetAddress })
        }
        else if (id === "id") {
            setAsset2({ assetType: asset2.assetType, assetID: e, assetQuantity: asset2.assetQuantity, assetAddress: asset2.assetAddress })
        }
        else if (id === "quantity") {
            setAsset2({ assetType: asset2.assetType, assetID: asset1.assetID, assetQuantity: e, assetAddress: asset1.assetAddress })
        }
        else if (id === "address") {
            setAsset2({ assetType: asset2.assetType, assetID: asset2.assetID, assetQuantity: asset2.assetQuantity, assetAddress: e })
        }
    }

    const handleSubmit = async () => {

        if (!boxFee) { return }

        isLoading(true);

        const loxkBoxContract = new ethers.Contract(
            lockBoxAddress,
            lockboxABI.abi,
            provider) as LockBox


        console.log("asset1 => ", asset1.assetType, asset1.assetID, asset1.assetQuantity, asset1.assetAddress)
        console.log("asset2 => ", asset2.assetType, asset2.assetID, asset2.assetQuantity, asset2.assetAddress)

        const signer = provider.getSigner()
        const LockTx = loxkBoxContract.connect(signer);
        let expiryTime = 60 * 60;


        if (asset1.assetType === 0 && asset1.assetAddress !== "" && asset1.assetID !== null) {

            if (asset2.assetType === 0 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 1 && asset2.assetAddress !== "" && asset2.assetQuantity !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    1,
                    ethers.utils.parseEther(asset2.assetQuantity.toString()),
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 3 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 2 && asset2.assetQuantity !== null) {

                try {
                    const tx = await LockTx?.createLockBox(
                        asset1.assetType,
                        asset1.assetAddress,
                        asset1.assetID,
                        1,
                        asset2.assetType,
                        NULL_ADDRESS,
                        1,
                        ethers.utils.parseEther(asset2.assetQuantity.toString()),
                        expiryTime-1,
                        { value: ethers.utils.parseEther(boxFee.toString()) }
                    )

                    await tx?.wait();


                }
                catch (e:any) {
                    console.log(e)
                    alert(e.data.message)
                }

            }
        }

        else if (asset1.assetType === 1 && asset1.assetAddress !== "" && asset1.assetQuantity !== null) {

            if (asset2.assetType === 0 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )

                await tx?.wait();
            }

            if (asset2.assetType === 1 && asset2.assetAddress !== "" && asset2.assetQuantity !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    1,
                    ethers.utils.parseEther(asset2.assetQuantity.toString()),
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )

                await tx?.wait();

            }

            if (asset2.assetType === 3 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )

                await tx?.wait();
            }

            if (asset2.assetType === 2 && asset2.assetQuantity !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    NULL_ADDRESS,
                    1,
                    ethers.utils.parseEther(asset2.assetQuantity.toString()),
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )

                await tx?.wait();

            }
        }

        else if (asset1.assetType === 3 && asset1.assetAddress !== "" && asset1.assetID !== null) {

            if (asset2.assetType === 0 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 1 && asset2.assetAddress !== "" && asset2.assetQuantity !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    1,
                    ethers.utils.parseEther(asset2.assetQuantity.toString()),
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 3 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    asset1.assetAddress,
                    asset1.assetID,
                    1,
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 2 && asset2.assetQuantity !== null) {

                try {
                    const tx = await LockTx?.createLockBox(
                        asset1.assetType,
                        asset1.assetAddress,
                        asset1.assetID,
                        1,
                        asset2.assetType,
                        NULL_ADDRESS,
                        1,
                        ethers.utils.parseEther(asset2.assetQuantity.toString()),
                        expiryTime-1,
                        { value: ethers.utils.parseEther(boxFee.toString()) }
                    )

                    await tx?.wait();


                }
                catch (e:any) {
                    console.log(e)
                    alert(e.data.message)
                }

            }
        }

        else if (asset1.assetType === 2 && asset1.assetAddress !== "" && asset1.assetQuantity !== null) {

            if (asset2.assetType === 0 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    NULL_ADDRESS,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 1 && asset2.assetAddress !== "" && asset2.assetQuantity !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    NULL_ADDRESS,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    1,
                    ethers.utils.parseEther(asset2.assetQuantity.toString()),
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 3 && asset2.assetAddress !== "" && asset2.assetID !== null) {

                const tx = await LockTx?.createLockBox(
                    asset1.assetType,
                    NULL_ADDRESS,
                    1,
                    ethers.utils.parseEther(asset1.assetQuantity.toString()),
                    asset2.assetType,
                    asset2.assetAddress,
                    asset2.assetID,
                    1,
                    expiryTime,
                    { value: ethers.utils.parseEther(boxFee.toString()) }
                )
                await tx?.wait();


            }

            if (asset2.assetType === 2 && asset2.assetQuantity !== null) {

                try {
                    const tx = await LockTx?.createLockBox(
                        asset1.assetType,
                        NULL_ADDRESS,
                        1,
                        ethers.utils.parseEther(asset1.assetQuantity.toString()),
                        asset2.assetType,
                        NULL_ADDRESS,
                        1,
                        ethers.utils.parseEther(asset2.assetQuantity.toString()),
                        expiryTime-1,
                        { value: ethers.utils.parseEther(boxFee.toString()) }
                    )

                    await tx?.wait();


                }
                catch (e:any) {
                    console.log(e)
                    alert(e.data.message)
                }

            }
        }

        else {
            alert("Provide the LockBox Data please");
            throw("ERROR");
        }

        const BoxID = await loxkBoxContract.counter();
        alert(`Success, your LockBox ID is ${BoxID}`)

        const boxInfo = await loxkBoxContract.lockBoxInfo(Number(BoxID));

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
            boxId: Number(BoxID),

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
            boxId: Number(BoxID),

        }
        const box: Box = {
            boxId: Number(BoxID),
            assetA,
            assetB,
            expiryTime: Number(boxInfo.expiryTime),
            lockBoxOwner: boxInfo.lockBoxOwner,
            status: boxInfo.status
        }

        dispatch(createBoxData(box))
        isLoading(false);


    }

    const [contractMethods, setContractMethods] = useState<LockBox | null>()
    const [boxFee, setBoxFee] = useState<number | null>()
    const [boxBalance, setBoxBalance] = useState<number | null>()
    const [userBalance, setUserBalance] = useState<number | null>()
    const [boxesCount, setBoxesCount] = useState<number | null>()

    useEffect(() => {
        fatchBlockChainData();
    }, [])

    useEffect(() => {
        fetchUserBalance();
    }, [active])


    const fetchUserBalance = async () => {
        // const loxkBoxContract = new ethers.Contract(
        //     "0x28383c75B9975c3F4D740eeE541413fb3B37dF5f",
        //     lockboxABI.abi,
        //     provider) as LockBox

        console.log("account ", account)
        if (account) {
            let balance_of_user = await provider.getBalance(account);
            let balance_of_user2 = ethers.utils.formatEther(balance_of_user)
            setUserBalance(Number(balance_of_user2))
        }


    }

    const fatchBlockChainData = async () => {

        const loxkBoxContract = new ethers.Contract(
            lockBoxAddress,
            lockboxABI.abi,
            provider) as LockBox
        // console.log("loxkBoxContract", loxkBoxContract)
        setContractMethods(loxkBoxContract)

        let boxFeee = await loxkBoxContract.boxFee();
        let boxFeee2 = ethers.utils.formatEther(boxFeee?.toString())
        setBoxFee(Number(boxFeee2))

        let balance_of_contract = await provider.getBalance(lockBoxAddress);
        let balance_of_contract2 = ethers.utils.formatEther(balance_of_contract)
        setBoxBalance(Number(balance_of_contract2))

        let boxes = await loxkBoxContract.counter();
        setBoxesCount(Number(boxes))

    }


    return <div className={classes.container}>
        <div style={{ textAlign: "center" }}>
            <div>
                Create A LockBox
            </div>
        </div>

        <div className={classes.header}>

            <div>
                Fee: {boxFee ? `${boxFee} Ethers` : ""}
            </div>
            <div>
                boxBalance: {boxBalance ? `${boxBalance.toFixed(3)} ETH` : ""}
            </div>
            <div>
                boxesCount: {boxesCount ? `${boxesCount}` : ""}
            </div>
            <div>
                userBalance: {userBalance ? `${userBalance.toFixed(3)} ETH` : "Connect wallet"}
            </div>

        </div>

        <div className={classes.body}>

            {/* Assets 1 */}
            <Grid container spacing={1} style={{ marginBottom: 20 }}>
                <Grid item xs={12} sx={{ textAlign: "center" }}> Asset 1 </Grid>

                <Grid item xs={12} >
                    <FormControl fullWidth={true}>
                        <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={asset1.assetType}
                            label="Asset Type"
                            onChange={(e) => handleAssest1Change(e.target.value, "type")}
                        >
                            <MenuItem value={4}>Choose one</MenuItem>
                            <MenuItem value={0}>ERC721 Token</MenuItem>
                            <MenuItem value={1}>ERC20 Token</MenuItem>
                            <MenuItem value={2}>Ethers</MenuItem>
                            <MenuItem value={3}>ERC1155 Token</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>


                {
                    asset1.assetType === 0 && (
                        <>
                            <Grid item xs={3}>
                                <TextField value={asset1.assetID} onChange={(e) => handleAssest1Change(e.target.value, "id")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset ID" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset1.assetAddress} onChange={(e) => handleAssest1Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }


                {
                    asset1.assetType === 1 && (
                        <>
                            <Grid item xs={3} >
                                <TextField value={asset1.assetQuantity} onChange={(e) => handleAssest1Change(e.target.value, "quantity")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset Quantity in Ethers" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset1.assetAddress} onChange={(e) => handleAssest1Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }

                {
                    asset1.assetType === 3 && (
                        <>
                            <Grid item xs={3}>
                                <TextField value={asset1.assetID} onChange={(e) => handleAssest1Change(e.target.value, "id")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset ID" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset1.assetAddress} onChange={(e) => handleAssest1Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }

                {
                    asset1.assetType === 2 && (
                        <Grid item xs={12} >
                            <TextField value={asset1.assetQuantity} onChange={(e) => handleAssest1Change(e.target.value, "quantity")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset Quantity in Ethers" variant="outlined" />
                        </Grid>
                    )
                }


            </Grid>

            {/* Assets 2 */}
            <Grid container spacing={1} style={{ marginBottom: 20 }}>
                <Grid item xs={12} sx={{ textAlign: "center" }}> Asset 2 </Grid>

                <Grid item xs={12} >
                    <FormControl fullWidth={true}>
                        <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={asset2.assetType}
                            label="Asset Type"
                            onChange={(e) => handleAssest2Change(e.target.value, "type")}
                        >
                            <MenuItem value={4}>Choose one</MenuItem>
                            <MenuItem value={0}>ERC721 Token</MenuItem>
                            <MenuItem value={1}>ERC20 Token</MenuItem>
                            <MenuItem value={2}>Ethers</MenuItem>
                            <MenuItem value={3}>ERC1155 Token</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>


                {
                    asset2.assetType === 0 && (
                        <>
                            <Grid item xs={3}>
                                <TextField value={asset2.assetID} onChange={(e) => handleAssest2Change(e.target.value, "id")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset ID" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset2.assetAddress} onChange={(e) => handleAssest2Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }


                {
                    asset2.assetType === 1 && (
                        <>
                            <Grid item xs={3} >
                                <TextField value={asset2.assetQuantity} onChange={(e) => handleAssest2Change(e.target.value, "quantity")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset Quantity in Ethers" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset2.assetAddress} onChange={(e) => handleAssest2Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }

                {
                    asset2.assetType === 3 && (
                        <>
                            <Grid item xs={3}>
                                <TextField value={asset2.assetID} onChange={(e) => handleAssest2Change(e.target.value, "id")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset ID" variant="outlined" />
                            </Grid>
                            <Grid item xs={9} >
                                <TextField value={asset2.assetAddress} onChange={(e) => handleAssest2Change(e.target.value, "address")} sx={{ width: "100%" }} type="text" id="outlined-basic" label="Address of Asset" variant="outlined" />
                            </Grid>
                        </>
                    )
                }

                {
                    asset2.assetType === 2 && (
                        <Grid item xs={12} >
                            <TextField value={asset2.assetQuantity} onChange={(e) => handleAssest2Change(e.target.value, "quantity")} sx={{ width: "100%" }} type="number" id="outlined-basic" label="Asset Quantity in Ethers" variant="outlined" />
                        </Grid>
                    )
                }

            </Grid>

            {/* <div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        renderInput={(props) => <TextField {...props} />}
                        label="DateTimePicker"
                        value={0}
                        onChange={(newValue) => {
                            console.log(newValue);
                        }}
                    />
                </LocalizationProvider>
            </div> */}

            <div className={classes.button}>
                <Button onClick={handleSubmit} type="submit" variant="contained" sx={{ borderRadius: 0 }}>
                    {
                        loading ?
                            <> Creating A Box <CircularProgress size={20} sx={{ color: "white", marginLeft: "10px" }} /> </> :
                            "Create A Box"
                    }
                </Button>
            </div>

        </div>

    </div>

};

export default CreateABox;


const useStyles = makeStyles({
    container: {
        borderRight: "1px solid black",
        height: "100%"
    },
    header: {
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "0px solid black",
        padding: "10px"

    },
    body: {
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
    button: {
        border: "0px solid black",
        display: "flex",
        justifyContent: "center",
        marginTop: "20px"
    }
});

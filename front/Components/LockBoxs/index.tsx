import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { SEPOLIA_RPC_URL, getAssetType, trimAddress } from '../../utils';
import Countdown from 'react-countdown';
import { LockBox, TestNFT } from '../../Contracts/typechain-types';
import { ERC721ABI, LockBoxABI, LockBoxAddress } from '../../Contracts'
import { Box, Center, HStack, Text, Flex } from '@chakra-ui/layout'
import { Contract, ethers } from 'ethers'
import { Spinner } from '@chakra-ui/spinner';
import { AssetType, LockStatus, NULL_ADDRESS, Status } from '../../types';
import { Card } from '@chakra-ui/card';
import { Button, Tag } from '@chakra-ui/react';
import { JsonRpcProvider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

export const getBoxStatus = (status: number) => {
    if (status == Status.PENDING) {
        return <Tag bgColor="yellow.300">Pending</Tag>
    }
    if (status == Status.SUCCEED) {
        return <Tag bgColor="green.300"> Successful </Tag>
    }
    if (status == Status.FAILED) {
        return <Tag bgColor="red.300">Failed</Tag>
    }
    if (status == Status.CANCELLED) {
        return <Tag bgColor="orange.300">Cancelled</Tag>
    }
}


const LockBoxs = () => {

    const { account, library: provider } = useWeb3React<JsonRpcProvider>();

    const [loading, setLoading] = useState<boolean>(false);

    const [generalData, setGeneralData] = useState({
        count: 0,
        boxFee: ""
    });

    const [boxesData, setBoxesData] = useState<LockBox.LockBoxInfoStructOutput[]>([])

    const fetchLockBoxData = async () => {
        setLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(LockBoxAddress, LockBoxABI, provider) as LockBox;

        const _count = contract.getLockBoxCount();
        const _boxFee = contract.getLockBoxFee();
        const [count, boxFee] = await Promise.all([_count, _boxFee]);
        setGeneralData({ count: Number(count.toString()), boxFee: ethers.utils.formatEther(boxFee) })

        const boxes = await contract.getLockBoxesInfo(Number(count), 10);

        setBoxesData(boxes);
        setLoading(false);
    }

    useEffect(() => {
        fetchLockBoxData()
    }, [])

    const swap = async (box: LockBox.LockBoxInfoStructOutput) => {
        if (provider && account) {
            const boxId = box.boxId;
            const assetB = box.assetB;


            if (assetB.assetType == AssetType.COIN) {
                try {
                    const balance = await provider.getBalance(account);
                    if (balance.lt(assetB.assetQuantity)) {
                        alert("Insufficient balance")
                        return;
                    }
                    else {
                        const signer = provider.getSigner();
                        const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
                        const tx = await LockBoxContract.swapAssets(boxId, { value: assetB.assetQuantity });
                        await tx.wait(1);
                    }
                }
                catch (e) {
                    console.error(e);
                }

            }

            if (assetB.assetType == AssetType.NFT) {
                try {

                    const signer = provider.getSigner();
                    const NFTContract = new Contract(assetB.assetAddress, ERC721ABI, signer) as TestNFT;
                    const approvedTo = await NFTContract.getApproved(assetB.assetID);

                    if (approvedTo != LockBoxAddress) {
                        const confirm = window.confirm("Do you want to approve the NFT to LockBox contract?");
                        if (confirm) {
                            const tx = await NFTContract.approve(LockBoxAddress, assetB.assetID);
                            await tx.wait(1);

                            const signer = provider.getSigner();
                            const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
                            const tx2 = await LockBoxContract.swapAssets(boxId);
                            await tx2.wait(1);

                        }
                        else {
                            return;
                        }
                    }
                    else {
                        const signer = provider.getSigner();
                        const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
                        const tx = await LockBoxContract.swapAssets(boxId);
                        await tx.wait(1);
                    }


                    // const balance = await provider.getBalance(account);
                    // if (balance.lt(assetB.assetQuantity)) {
                    //     alert("Insufficient balance")
                    //     return;
                    // }
                    // else {
                    //     const signer = provider.getSigner();
                    //     const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
                    //     const tx = await LockBoxContract.swapAssets(boxId, { value: assetB.assetQuantity });
                    //     await tx.wait(1);
                    // }
                }
                catch (e) {
                    console.error(e);
                }

            }


        }

    }

    const cancel = async (boxId: string) => {

        if (provider && account) {
            try {
                const signer = provider.getSigner();
                const LockBoxContract = new Contract(LockBoxAddress, LockBoxABI, signer) as LockBox;
                const tx = await LockBoxContract.cancelLockBox(boxId);
                await tx.wait(1);
            }
            catch (e) {
                console.log(e)
            }
        }

    }

    const Loader = () => <Center w="full" my="100px"> loading... <Spinner ml="5px" /> </Center>

    const GeneralData = () => {
        return (
            <Box m="20px">
                <Box w="200px"> Count: {generalData.count} </Box>
                <Box w="200px"> Box Fee: {generalData.boxFee} ETHs</Box>
            </Box>
        )
    }

    const getAssetImage = (asset: number) => {
        if (asset == AssetType.NFT) {
            return <Image alt="ERC721" src="/ERC721.jpeg" width="200px" height="200px" />
        }
        if (asset == AssetType.ERC1155) {
            return <Image alt="ERC1155" src="/ERC1155.jpeg" width="200px" height="200px" />
        }
        if (asset == AssetType.TOKEN) {
            return <Image alt="ERC20" src="/ERC20.jpeg" width="200px" height="200px" />
        }
        if (asset == AssetType.COIN) {
            return <Image alt="etherium" src="/etherium.jpeg" width="200px" height="200px" />
        }
    }

    const expiryCountdown = (timestamp: string | number) => {
        const FN = (e: number) => e.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
        return (
            <Countdown date={Number(timestamp) * 1000}
                renderer={({ days, hours, minutes, seconds, completed }) => {
                    if (completed) return <div> Expired </div>;
                    else return <span>Remaining Time: {FN(days)}:{FN(hours)}:{FN(minutes)}:{FN(seconds)}</span>;
                }}
            />
        )
    }

    const AssetCard = ({ title, box }: { title: "Asset 1" | "Asset 2", box: LockBox.LockBoxInfoStructOutput }) => {

        const asset = title == "Asset 1" ? box.assetA : box.assetB;

        return (

            <Card
                bgColor="cream"
                h="full"
                border="0px solid red"
                p="20px"
            >
                <Text textAlign="center"> {title} </Text>

                <HStack p="20px" spacing={10}>
                    <Box>
                        <Text> Type: {getAssetType(asset.assetType)} </Text>

                        {
                            asset.assetType !== AssetType.COIN && (
                                <>
                                    <Text> Address: {trimAddress(asset.assetAddress)} </Text>
                                    <Text> Id: {asset.assetID.toString()} </Text>
                                </>
                            )
                        }

                        {
                            asset.assetType == AssetType.COIN && (
                                <Text> Quantity: {ethers.utils.formatEther(asset.assetQuantity)} ETHs</Text>
                            )
                        }

                        {
                            asset.assetType == AssetType.ERC1155 && (
                                <Text> Quantity: {asset.assetQuantity.toString()} </Text>
                            )
                        }

                    </Box>

                    <Box w="200px" h="200px" border="0px solid red" >
                        {getAssetImage(asset.assetType)}
                    </Box>
                </HStack>

                {
                    title == "Asset 1" && account == box.owner && box.status === Status.PENDING && (
                        <Flex w="full" justify="flex-end">
                            <Button
                                onClick={() => cancel(box.boxId.toString())}
                                bgColor='blue.200'
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </Flex>
                    )
                }


                {
                    title == "Asset 2" && account && box.status === Status.PENDING && (
                        <Flex w="full" justify="flex-end">
                            <Button
                                onClick={() => swap(box)}
                                bgColor='blue.200'
                                size="sm"
                            >
                                Swap
                            </Button>
                        </Flex>
                    )
                }




            </Card>
        )

    }

    const BoxesData = () => {
        return (
            <Box p="10px" m="auto" border="0px solid red">
                {
                    boxesData.map((box, index) => {
                        return (
                            <Card key={index} border="1px solid #f8f8f8" m="16px auto" p="20px">
                                <Text> Box Creator: {trimAddress(box.owner)} </Text>
                                <Text> Box Status {getBoxStatus(Number(box.status))} </Text>

                                {
                                    Number(box.status) === Status.PENDING && (
                                        <Text> Expired in {expiryCountdown(Number(box.expiryTime))} </Text>
                                    )
                                }

                                <HStack key={index} border="0px solid red" m="20px auto" justify="space-between">
                                    <AssetCard title="Asset 1" box={box} />
                                    <Center w="200px" alignItems="center">
                                        Swap
                                    </Center>
                                    <AssetCard title="Asset 2" box={box} />
                                </HStack>

                            </Card>
                        )
                    })
                }
            </Box>
        )
    }

    return (
        <Box border="0px solid red" m="20px">
            {
                generalData.count && (
                    <GeneralData />
                )
            }


            {
                loading ? (
                    <Loader />
                ) : (
                    <Box>
                        <BoxesData />
                    </Box>
                )
            }



        </Box>
    )

}

export default LockBoxs
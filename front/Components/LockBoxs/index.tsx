import { LockBox } from '../../Contracts/typechain-types';
import { LockBoxABI, LockBoxAddress } from '../../Contracts'
import { SEPOLIA_RPC_URL, getAssetApprovalStatus, getAssetClaimStatus, getAssetLockStatus, getAssetType, getBoxStatus, trimAddress } from '../../utils';
import { Box, Center, Flex, HStack, Text } from '@chakra-ui/layout'
import { ethers } from 'ethers'
import React, { use, useEffect, useState } from 'react'
import { Spinner } from '@chakra-ui/spinner';
import Countdown from 'react-countdown';
import { AssetType, NULL_ADDRESS } from '../../types';
import { Card } from '@chakra-ui/card';
import Image from 'next/image';

const index = () => {

    const [loading, setLoading] = useState<boolean>(false);

    const [generalData, setGeneralData] = useState({
        count: 0,
        boxFee: ""
    });

    const [boxesData, setBoxesData] = useState<
        {
            lockBoxOwner: string;
            expiryTime: ethers.BigNumber;
            status: number;
            assetA: LockBox.AssetStructOutput;
            assetB: LockBox.AssetStructOutput;
        }[]>([])

    const fetchLockBoxData = async () => {
        setLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(LockBoxAddress, LockBoxABI, provider) as LockBox;

        const _count = contract.counter();
        const _boxFee = contract.boxFee();
        const [count, boxFee] = await Promise.all([_count, _boxFee]);
        setGeneralData({ count: Number(count.toString()), boxFee: ethers.utils.formatEther(boxFee) })

        let unresolvedBoxes = [];
        for (let i = Number(count); i > 0; i--) {
            unresolvedBoxes.push(contract.lockBoxInfo(i));
        }

        const boxes = await Promise.all(unresolvedBoxes);

        setBoxesData(boxes);
        setLoading(false);
    }

    useEffect(() => {
        fetchLockBoxData()
    }, [])



    const Loader = () => <Center w="full" my="100px"> loading... <Spinner ml="5px" /> </Center>

    const GeneralData = () => {
        return (
            <Box m="20px">
                <Box w="200px"> Count: {generalData.count} </Box>
                <Box w="200px"> Box Fee: {generalData.boxFee} ETHs</Box>
            </Box>
        )
    }


    // struct LockBoxInfo {
    //     address lockBoxOwner;
    //     uint expiryTime;
    //     Status status;
    //     Asset assetA;
    //     Asset assetB;
    // }

    // struct Asset {
    //     AssetType assetType;
    //     address owner;
    //     address assetAddress;
    //     uint assetID;
    //     uint assetQuantity;
    //     LockStatus lockStatus;
    //     ApprovalStatus approvalStatus;
    //     ClaimStatus claimStatus;
    //     address claimedBy;
    // }

    const getAssetImage = (asset: number) => {
        if(asset == AssetType.NFT){
            return <Image src="/ERC721.jpeg" width="200px" height="200px" />
        }
        if(asset == AssetType.ERC1155){
            return <Image src="/ERC1155.jpeg" width="200px" height="200px" />
        }
        if(asset == AssetType.TOKEN){
            return <Image src="/ERC20.jpeg" width="200px" height="200px" />
        }
        if(asset == AssetType.COIN){
            return <Image src="/etherium.jpeg" width="200px" height="200px" />
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
    
    const BoxesData = () => {
        return (
            <Box  p="10px" m="auto" border="0px solid red">
                {
                    boxesData.map((box, index) => {
                        return (
                            <Card border="1px solid #f8f8f8" m="16px auto" p="10px">
                                <Text> Box Creator: {trimAddress(box.lockBoxOwner)} </Text>
                                <Text> Box Status {getBoxStatus(Number(box.status))} </Text>
                                <Text> Expired in {expiryCountdown(Number(box.expiryTime))} </Text>

                                <HStack key={index} border="0px solid red" m="20px auto" justify="space-between">


                                    <Card 
                                        bgColor="cream" 
                                        h="full" 
                                        border="0px solid red" 
                                        p="20px"
                                        >
                                        <Text textAlign="center"> Asset 1</Text>

                                        <HStack p="20px" spacing={10}>
                                            <Box>
                                                <Text> Type: {getAssetType(box.assetA.assetType)} </Text>
                                                <Text> Address: {trimAddress(box.assetA.assetAddress)} </Text>
                                                <Text> Id: {box.assetA.assetID.toString()} </Text>
                                                {
                                                    box.assetA.assetType == AssetType.COIN ? (
                                                        <Text> Quantity: {ethers.utils.formatEther(box.assetA.assetQuantity)} ETHs</Text>
                                                    ) : (
                                                        <Text> Quantity: {box.assetA.assetQuantity.toString()} </Text>
                                                    )
                                                }
                                                <Text> Approval Status: {getAssetApprovalStatus(Number(box.assetA.approvalStatus))} </Text>
                                                <Text> Lock Status: {getAssetLockStatus(Number(box.assetA.lockStatus))} </Text>
                                                <Text> Claim Status: {getAssetClaimStatus(Number(box.assetA.claimStatus))} </Text>
                                                {
                                                    box.assetA.claimedBy != NULL_ADDRESS && (
                                                        <Text> Claimed by: {trimAddress(box.assetA.claimedBy)} </Text>
                                                    )
                                                }
                                            </Box>

                                            <Box w="200px" h="200px" border="0px solid red" >
                                                {getAssetImage(box.assetA.assetType)}
                                            </Box>
                                        </HStack>
                                    </Card>

                                    <Center w="200px" alignItems="center">
                                        Swap
                                    </Center>

                                    <Card 
                                        bgColor="cream" 
                                        h="full" 
                                        border="0px solid red" 
                                        p="20px"
                                        >
                                        <Text textAlign="center"> Asset 2</Text>

                                        <HStack p="20px" spacing={10}>
                                            <Box>
                                                <Text> Type: {getAssetType(box.assetB.assetType)} </Text>
                                                <Text> Address: {trimAddress(box.assetB.assetAddress)} </Text>
                                                <Text> Id: {box.assetB.assetID.toString()} </Text>
                                                {
                                                    box.assetB.assetType == AssetType.COIN ? (
                                                        <Text> Quantity: {ethers.utils.formatEther(box.assetB.assetQuantity)} ETHs</Text>
                                                    ) : (
                                                        <Text> Quantity: {box.assetB.assetQuantity.toString()} </Text>
                                                    )
                                                }
                                                <Text> Approval Status: {getAssetApprovalStatus(Number(box.assetB.approvalStatus))} </Text>
                                                <Text> Lock Status: {getAssetLockStatus(Number(box.assetB.lockStatus))} </Text>
                                                <Text> Claim Status: {getAssetClaimStatus(Number(box.assetB.claimStatus))} </Text>
                                                {
                                                    box.assetB.claimedBy != NULL_ADDRESS && (
                                                        <Text> Claimed by: {trimAddress(box.assetB.claimedBy)} </Text>
                                                    )
                                                }
                                            </Box>

                                            <Box w="200px" h="200px" border="0px solid red" >
                                                {getAssetImage(box.assetB.assetType)}
                                            </Box>
                                        </HStack>
                                    </Card>

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

export default index
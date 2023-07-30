import React, { useEffect, useState } from 'react';

import { ethers, Contract } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

import {
    ERC1155ABI, ERC1155Address, ERC20ABI, ERC20Address, ERC721ABI, ERC721Address
} from '../Contracts';

import { TestNFT, TestToken } from '@/Contracts/typechain-types';
import { TestERC1155 } from '@/Contracts/typechain-types/contracts/TestERC1155.sol';

import { Box, Button, Center, Flex, HStack, Icon, Progress, Select, TagLabel, Tooltip, VStack } from '@chakra-ui/react';

import { injected } from '../pages/_app';
import { CopyIcon } from '@chakra-ui/icons';
import { trimAddress } from '../utils';


type TOKEN = {
    count: string;
    contract: null | TestToken;
    minting: boolean

}

type ERC1155 = {
    id: number,
    contract: null | TestERC1155;
    minting: boolean
}


const Header = () => {

    const { active, activate, deactivate, chainId,
        account, library: provider } = useWeb3React<JsonRpcProvider>();

    const connect = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                await activate(injected);
            } catch (e) {
                console.log(e);
            }
        } else {
            alert("Please use a web3 broswer/app");
        }
    };

    const [erc1155, setERC1155] = useState<ERC1155>({
        id: 1,
        contract: null,
        minting: false
    })

    const setID = (id: string) => {
        setERC1155({
            id: Number(id),
            contract: erc1155.contract,
            minting: erc1155.minting
        })
    }

    const mint = async (id: "ERC721" | "ERC20" | "ERC1155") => {

        if (!account) {
            await activate(injected);
        }

        const provider = new Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        if (id === "ERC721" && account) {
            const NFTContract = new Contract(ERC721Address, ERC721ABI, signer) as TestNFT;
            console.log("minting NFT")
            const tx = await NFTContract.mint(account);
            await tx.wait(2);
            alert(`Successfully minted NFT`);

        }
        else if (id === "ERC20" && account) {

            const TokenContract = new ethers.Contract(ERC20Address, ERC20ABI, signer) as TestToken
            const tx = await TokenContract['mint(address)'](account);
            await tx.wait(2);
            alert(`Successfully minted 100 tokens`);

        }
        else if (id === "ERC1155" && account) {

            const TokenERC1155 = new ethers.Contract(ERC1155Address, ERC1155ABI, provider) as TestERC1155
            const MintTx = TokenERC1155.connect(signer);
            const tx = await MintTx?.mint(erc1155.id, 1);
            await tx.wait(2);
        }

    }

    return (

        < Flex direction={{base: "column-reverse", lg:"row"}} border="0px solid red"  borderBottom="1px solid #dcdcdc" justify="space-between" p="20px">

            <VStack>

                <HStack border="0px solid red" w="full">

                    <a href={`https://sepolia.etherscan.io/address/${ERC20Address}`} target="_blank" rel="noreferrer">
                        <img
                            src="https://potatoheadsnft.com/assets/img/etherscan.png"
                            alt="EtherScan"
                            width="30px"
                            height="30px"
                        />
                    </a>

                    <Tooltip title="Copy token address">
                        <Icon as={CopyIcon}
                            sx={{ cursor: "pointer" }}
                            onClick={() => { navigator.clipboard.writeText(ERC20Address) }}
                        />
                    </Tooltip>

                    <Button
                        onClick={() => mint("ERC20")}
                        bgColor='blue.200'
                        size="sm"
                    >
                        Mint Tokens
                    </Button>


                </HStack>

                <HStack border="0px solid red" w="full">

                    <a href={`https://sepolia.etherscan.io/address/${ERC721Address}`} target="_blank" rel="noreferrer">
                        <img
                            src="https://potatoheadsnft.com/assets/img/etherscan.png"
                            alt="EtherScan"
                            width="30px"
                            height="30px"
                        />
                    </a>

                    <Tooltip title="Copy token address">
                        <Icon as={CopyIcon}
                            sx={{ cursor: "pointer" }}
                            onClick={() => { navigator.clipboard.writeText(ERC721Address) }}
                        />
                    </Tooltip>

                    <Button
                        onClick={() => mint("ERC721")}
                        bgColor='blue.200'
                        size="sm"
                    >
                        Mint An NFT
                    </Button>


                </HStack>

                <HStack border="0px solid red" w="full">

                    <a href={`https://sepolia.etherscan.io/address/${ERC1155Address}`} target="_blank" rel="noreferrer">
                        <img
                            src="https://potatoheadsnft.com/assets/img/etherscan.png"
                            alt="EtherScan"
                            width="30px"
                            height="30px"
                        />
                    </a>

                    <Tooltip title="Copy token address">
                        <Icon as={CopyIcon}
                            sx={{ cursor: "pointer" }}
                            onClick={() => { navigator.clipboard.writeText(ERC1155Address) }}
                        />
                    </Tooltip>

                    <Select
                        w="80px"
                        value={erc1155.id}
                        onChange={(e) => setID(e.target.value)}
                    >
                        <option value="1">Id: 1</option>
                        <option value="2">Id: 2</option>
                        <option value="3">Id: 3</option>
                        <option value="4">Id: 4</option>
                        <option value="5">Id: 5</option>
                    </Select>

                    <Button
                        onClick={() => mint("ERC1155")}
                        bgColor='blue.200'
                        size="sm"
                    >
                        Mint An ERC1155 Token
                    </Button>

                </HStack>

            </VStack>

            <Box>
                {
                    !active && (
                        <Button
                            onClick={connect}
                            bgColor='blue.200'
                            size="sm"    
                        >
                            Connect
                        </Button>
                    )
                }
                {
                    active && account && (
                        <div>
                            <div>Account: {trimAddress(account)}</div>
                            <div>Chain Id: {chainId}</div>
                        </div>
                    )
                }
            </Box>

        </Flex >
    )
};

export default Header;
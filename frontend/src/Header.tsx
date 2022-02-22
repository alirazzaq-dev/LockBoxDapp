import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useEthers, shortenAddress } from '@usedapp/core'
import { Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import { ethers, Contract } from "ethers";
import { LockBoxTestNFT, LockBoxTestTokens } from './typechain';
import CircularProgress from '@mui/material/CircularProgress';


const TestNFT = require("./abis/LockBoxTestNFT.json");
const NFTaddress = "0x5B508eB6e1540b3d48FE6cCa2f8394777547a019";

const TestToken = require("./abis/LockBoxTestTokens.json");
const TokenAddress = "0x566648603858016A5BE336aFb3f41E20EB8511D4";


type NFT = {
    count: string;
    contract: null | LockBoxTestNFT;
    minting: boolean

}

type TOKEN = {
    count: string;
    contract: null | LockBoxTestTokens;
    minting: boolean

}

const Header = () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const classes = useStyles();
    const { active, chainId, activateBrowserWallet, account } = useEthers();

    const [nft, setNft] = useState<NFT>({
        count: "0",
        contract: null,
        minting: false
    })
    const [token, setToken] = useState<TOKEN>({
        count: "0",
        contract: null,
        minting: false
    })

    console.log("chainId ", chainId)

    useEffect(() => {
        activateBrowserWallet();
        fatchBlockChainData();

    }, [])

    const fatchBlockChainData = async () => {

        const NFTContract = new ethers.Contract(NFTaddress, TestNFT.abi, provider) as LockBoxTestNFT
        // console.log("totalSupply of NFTs", Number( await NFTContract.totalSupply() ))
        setNft({
            count: (await NFTContract.totalSupply()).toString(),
            contract: NFTContract,
            minting: false
        })

        const TokenContract = new ethers.Contract(TokenAddress, TestToken.abi, provider) as LockBoxTestTokens
        // console.log("totalSupply of Tokens", Number( await TokenContract.totalSupply() ))
        const supply = await TokenContract.totalSupply();

        setToken({
            count: ethers.utils.formatEther(supply),
            contract: TokenContract,
            minting: false
        })

        // console.log("NFTContract ", NFTContract)

    }



    const mint = async (id: "ERC721" | "ERC20") => {
        const signer = provider.getSigner()

        if (!account) {
            await activateBrowserWallet()
        }


        if (id === "ERC721" && account) {
            const MintTx = nft.contract?.connect(signer);
            console.log("minting NFT")
            const tx = await MintTx?.mint(account)
            setNft({
                count: nft.count,
                contract: nft.contract,
                minting: true
            })

            await tx?.wait();
            const tokenid = Number(await nft.contract?.totalSupply());
            alert(`Your Token ID is ${tokenid - 1}`)

            setNft({
                count: String(tokenid),
                contract: nft.contract,
                minting: false
            })

        }
        else if (id === "ERC20" && account) {

            console.log("minting ERC20 Token")
            const MintTx = token.contract?.connect(signer);
            const tx = await MintTx?.mint(account, ethers.utils.parseEther("100"));
            setToken({
                count: token.count,
                contract: token.contract,
                minting: true
            })

            await tx?.wait();
            const tokenid = String(await token.contract?.totalSupply());

            alert(`Successfully minted 100 tokens`);

            setToken({
                count: ethers.utils.formatEther(tokenid),
                contract: token.contract,
                minting: false
            })


        }
    }


    return (
        <div className={classes.header}>

            <div className={classes.mintingConainter} >
                <div className={classes.mintingToken}>

                    <div style={{ border: "0px solid black", display: "flex", alignItems: "center" }}>
                        <Tooltip title="Check on Bincance scan">
                            <a href='https://testnet.bscscan.com/address/0x5B508eB6e1540b3d48FE6cCa2f8394777547a019' target="_blank">
                                <img
                                    src="https://potatoheadsnft.com/assets/img/etherscan.png"
                                    alt="EtherScan"
                                    width="30px"
                                    height="30px"
                                />
                            </a>
                        </Tooltip>

                        <Tooltip title="Copy token address">
                            <ContentCopyIcon
                                sx={{ cursor: "pointer" }}
                                onClick={() => { navigator.clipboard.writeText("0x5B508eB6e1540b3d48FE6cCa2f8394777547a019") }}
                            />
                        </Tooltip>
                    </div>

                    <Button onClick={() => mint("ERC721")} variant='contained' size='small' sx={{ borderRadius: 0, width: "150px" }}> Mint An NFT </Button>

                    {
                        nft.minting && (
                            <div><CircularProgress size={16} /></div>
                        )
                    }

                    <div style={{border: "0px solid black", width: "100px", display: "flex", justifyContent: "end"}}>
                        Count: {nft.count}
                    </div>

                </div>

                <div className={classes.mintingToken}>

                    <div style={{ border: "0px solid black", display: "flex", alignItems: "center" }}>
                        <Tooltip title="Check on Bincance scan">
                            <a href='https://testnet.bscscan.com/address/0x566648603858016A5BE336aFb3f41E20EB8511D4' target="_blank">
                                <img
                                    src="https://potatoheadsnft.com/assets/img/etherscan.png"
                                    alt="EtherScan"
                                    width="30px"
                                    height="30px"
                                />
                            </a>
                        </Tooltip>

                        <Tooltip title="Copy token address">
                            <ContentCopyIcon
                                sx={{ cursor: "pointer" }}
                                onClick={() => { navigator.clipboard.writeText("0x566648603858016A5BE336aFb3f41E20EB8511D4") }}
                            />
                        </Tooltip>
                    </div>

                    <Button onClick={() => mint("ERC20")} variant='contained' size='small' sx={{ borderRadius: 0, width: "150px" }}> Mint 100 Tokens </Button>

                    {
                        token.minting && (
                            <div><CircularProgress size={16} /></div>
                        )
                    }
                    <div style={{border: "0px solid black", width: "100px", display: "flex", justifyContent: "end"}}>
                        Count: {token.count}
                    </div>



                </div>


            </div>



            {
                !active && (
                    <Button onClick={() => activateBrowserWallet()} variant='contained' size='small' sx={{ borderRadius: 0 }}> Connect </Button>
                )
            }
            {
                active && account && (
                    <div>
                        <div>Account: {shortenAddress(account.toString())}</div>
                        <div>Chain Id: {chainId}</div>
                    </div>
                )}

        </div>
    )
};

export default Header;

const useStyles = makeStyles({
    root: {
    },
    header: {
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginRight: "20px",
        marginTop: "20px"
    },
    mintingConainter: {
        // border: "1px solid black",
        height: "100px",
        marginTop: "40px"
    },
    mintingToken: {
        // border: "1px solid black",
        width: "350px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: "5px",
        marginLeft: "5px",


    },

});
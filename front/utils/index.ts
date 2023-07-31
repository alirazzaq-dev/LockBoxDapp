import { ApprovalStatus, AssetType, ClaimStatus, LockStatus, Status } from "../types";

export const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/6aaf945bb21340a5a0382fb45492ec39";
export const targetChain = 11155111;

export const trimAddress = (address: string, num: number = 5) => {
    if (address) return address.slice(0, num) + "..." + (address.slice(42 - num + 1, 42));
    else return address;
}

export const handleNetworkChange = async () => {
    try {
        await window.ethereum.request(
            {
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: "0x" + (11155111).toString(16), //5
                    },
                ],
            }
        );
        return true;
    } catch (e: any) {
        console.error(e);
        return false;
    }
    /// Reference: https://stackoverflow.com/questions/68252365/how-to-trigger-change-blockchain-network-request-on-metamask
};

export const getAssetType = (asset: number) => {
    if(asset == AssetType.NFT){
        return "ERC721 NFT";
    }
    if(asset == AssetType.ERC1155){
        return "ERC1155 NFT";
    }
    if(asset == AssetType.TOKEN){
        return "ERC20 Token";
    }
    if(asset == AssetType.COIN){
        return "Coin";
    }

}

export const getAssetLockStatus = (status: number) => {
    if(status == LockStatus.LOCKED){
        return "Locked";
    }
    if(status == LockStatus.NOT_LOCKED){
        return "Not Locked";
    }
}

export const getAssetApprovalStatus = (status: number) => {
    if(status == ApprovalStatus.APPROVED){
        return "Approved";
    }
    if(status == ApprovalStatus.NOT_APPROVED){
        return "Not Approved";
    }
}

export const getAssetClaimStatus = (status: number) => {
    if(status == ClaimStatus.CLAIMED){
        return "Claimed";
    }
    if(status == ClaimStatus.NOT_CLAIMED){
        return "Not Claimed";
    }
}
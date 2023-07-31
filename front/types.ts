export enum AssetType {
    NFT = 0,
    TOKEN = 1,
    COIN = 2,
    ERC1155 = 3
}
export enum Status { 
    PENDING=0, 
    SUCCEED=1, 
    FAILED=2 
}
export enum ClaimStatus { 
    NOT_CLAIMED=0, 
    CLAIMED=1 
}

export enum LockStatus {
    NOT_LOCKED = 0,
    LOCKED = 1
}
export enum ApprovalStatus { 
    NOT_APPROVED = 0, 
    APPROVED = 1 
}

export type Asset = {
    type: AssetType,
    id: number,
    quantity: number,
    address: string
}

export const NULL_ASSET = {
    type: AssetType.NFT,
    id: 0,
    quantity: 0,
    address: ""
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
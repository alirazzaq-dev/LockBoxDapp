import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { LockBox } from '../typechain';



export interface Asset {
  assetType: number,
  owner: string,
  // ownedByYou: boolean,
  assetAddress: string,
  assetID: number,
  assetQuantity: number,
  lockStatus: number,
  approvalStatus: number,
  claimStatus: number,
  claimedBy: string,
  boxId: number
}

export interface Box {
  boxId: number,
  assetA: Asset,
  assetB: Asset,
  expiryTime: number,
  lockBoxOwner: string,
  status: number
}


interface MasterContracts {
  lockBoxAddress: string,
  lockBoxMethods: LockBox | null
}

interface NetworkDetail {
  id: number,
  chain: string
}

interface UserInfo {
  userAddress: string,
}


export interface DataType {
  networkDetail: NetworkDetail,
  userInfo: UserInfo,
  loading: boolean,
  transectionProgress: boolean,
  masterContracts: MasterContracts,
  lockBoxData : Box[] | null 
}

const initialState: DataType = {
  networkDetail: {
    id: 0,
    chain: "",
  },
  userInfo: {
    userAddress: "",
  },
  loading: false,
  transectionProgress: false,
  masterContracts: {
    lockBoxAddress: "0x5df4d61ee363B7B7528C2eDca37AE476926e21dc",
    lockBoxMethods: null
    },
  lockBoxData: null
}

const dataSlice = createSlice({
  name: "LockBox",
  initialState,
  reducers: {
    clearState(state) {
      return initialState;
    },

    // setActiveUserInfo(state, { payload }: PayloadAction<{ address: string, balance: number, erc20Symbol: string }>) {
    //   state.userInfo.userAddress = payload.address;
    // },
    
    setActiveUser(state, { payload }: PayloadAction<string>){
      state.userInfo.userAddress = payload;
    },

    setNetworkDetails(state, { payload }: PayloadAction<NetworkDetail>){
      state.networkDetail.id = payload.id;
      state.networkDetail.chain = payload.chain;
    },

    setLoading(state, { payload }: PayloadAction<boolean>) {
      state.loading = payload
    },

    setLockerMasterMethods(state, {payload}: PayloadAction<any>){
      state.masterContracts.lockBoxMethods = payload
    },

    setTransactionProgress(state, { payload }: PayloadAction<boolean>) {
      state.transectionProgress = payload
    },

    addBoxData(state, { payload }: PayloadAction<Box | null> ) {
      if(payload === null){
        state.lockBoxData = null;
      }
      else if(state.lockBoxData === null){
        state.lockBoxData = [payload];
      }
      else {
        state.lockBoxData.push(payload)
      }
    },

    createBoxData(state, { payload }: PayloadAction<Box> ) {
      if(state.lockBoxData === null){
        state.lockBoxData = [payload];
      }
      else {
        state.lockBoxData.unshift(payload)
      }
    },

    updateLockedAsset(state, { payload }: PayloadAction<{boxID: number, type: "A"|"B", asset: Asset, }> ) {
      console.log("updateLockedAsset ", payload)
      state.lockBoxData && state.lockBoxData.map((box) => {
        if(box.boxId === payload.boxID){
          if(payload.type === "A"){
            box.assetA.lockStatus = 1;
          }
          else{
            box.assetB.lockStatus = 1;
          }
        }
      })
    },

    updateApprovedAsset(state, { payload }: PayloadAction<{boxID: number, type: "A"|"B", asset: Asset, }> ) {
      console.log("updateLockedAsset ", payload)
      state.lockBoxData && state.lockBoxData.map((box) => {
        if(box.boxId === payload.boxID){
          if(payload.type === "A"){
            box.assetA.approvalStatus = 1;
          }
          else{
            box.assetB.approvalStatus = 1;
          }
        }
      })
    },

    updateClaimedAsset(state, { payload }: PayloadAction<{boxID: number, type: "A"|"B", asset: Asset, }> ) {
      console.log("updateLockedAsset ", payload)
      state.lockBoxData && state.lockBoxData.map((box) => {
        if(box.boxId === payload.boxID){
          if(payload.type === "A"){
            box.assetA.claimStatus = 1;
          }
          else{
            box.assetB.claimStatus = 1;
          }
        }
      })
    },

  }


});




// Extract the action creators object and the reducer
const { actions, reducer } = dataSlice
// Extract and export each action creator by name
export const { createBoxData, updateClaimedAsset, updateApprovedAsset, updateLockedAsset, addBoxData, setLockerMasterMethods, setActiveUser, setNetworkDetails } = actions
// Export the reducer, either as a default or named export
export default reducer

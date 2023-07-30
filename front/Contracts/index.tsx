import LockBox from "./sepolia/LockBox.json";
import TestERC1155 from "./sepolia/TestERC1155.json";
import TestNFT from "./sepolia/TestNFT.json";
import TestToken from "./sepolia/TestToken.json";

export const LockBoxABI = LockBox.abi;
export const LockBoxAddress = LockBox.address;

export const ERC1155ABI = TestERC1155.abi;
export const ERC1155Address = TestERC1155.address;

export const ERC721ABI = TestNFT.abi;
export const ERC721Address = TestNFT.address;

export const ERC20ABI = TestToken.abi;
export const ERC20Address = TestToken.address;
export const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/6aaf945bb21340a5a0382fb45492ec39";


export const trimAddress = (address: string, num:number = 5) => {
    if (address) return address.slice(0, num) + "..." + (address.slice(42 - num + 1 , 42));
    else return address;
}
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

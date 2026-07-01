import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

export const connectWallet = async (): Promise<string> => {
    try {
        const connected = await isConnected();
        if (!connected.isConnected) {
            throw new Error("Freighter wallet is not installed. Please install it from https://www.freighter.app/");
        }

        const access = await requestAccess();
        if (access.error) {
            throw new Error(access.error);
        }

        return access.address;
    } catch (error) {
        console.error("Wallet connection failed", error);
        throw error;
    }
};

export const signAndSend = async (transactionXdr: string, networkPassphrase?: string) => {
    const result = await signTransaction(transactionXdr, { networkPassphrase });
    if (result.error) {
        throw new Error(String(result.error));
    }
    return result.signedTxXdr;
};

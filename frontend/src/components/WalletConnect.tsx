import React from 'react';
import { connectWallet } from '../utils/wallet';
import { Wallet } from 'lucide-react';

interface WalletConnectProps {
    onConnect: (address: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
    const handleConnect = async () => {
        try {
            const address = await connectWallet();
            onConnect(address);
        } catch (error) {
            alert("Failed to connect wallet");
        }
    };

    return (
        <button 
            onClick={handleConnect}
            className="neon-button flex items-center gap-2"
        >
            <Wallet size={18} />
            <span>Connect Wallet</span>
        </button>
    );
};

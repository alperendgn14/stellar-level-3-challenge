import React, { useState } from 'react';
import { invokeContract } from '../utils/contract';
import { CONTRACT_ADDRESSES } from '../utils/contract';
import { Send, Clock, DollarSign } from 'lucide-react';

export const CreateProposal: React.FC = () => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('86400');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await invokeContract(CONTRACT_ADDRESSES.GOVERNANCE, 'propose', [
                Date.now(), 
                recipient, 
                parseInt(amount), 
                'TOKEN_ADDRESS', 
                parseInt(duration)
            ]);
            alert("🚀 Proposal beamed to the blockchain!");
        } catch (error) {
            alert("⚠️ Signal lost. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-galactic-neon"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Send className="text-galactic-neon" size={24} />
                Initiate Proposal
            </h2>
            
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-xs font-bold text-galactic-neon uppercase tracking-wider mb-1 block">Recipient ID</label>
                    <input 
                        type="text" 
                        value={recipient} 
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full p-3 rounded-lg bg-galactic-deep/50 border neon-border focus:outline-none focus:ring-1 focus:ring-galactic-neon transition-all"
                        placeholder="GD...XXXX"
                        required
                    />
                </div>
                
                <div className="relative">
                    <label className="text-xs font-bold text-galactic-neon uppercase tracking-wider mb-1 block">Amount (XLM)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg bg-galactic-deep/50 border neon-border focus:outline-none focus:ring-1 focus:ring-galactic-neon transition-all"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-xs font-bold text-galactic-neon uppercase tracking-wider mb-1 block">Execution Window</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="number" 
                            value={duration} 
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg bg-galactic-deep/50 border neon-border focus:outline-none focus:ring-1 focus:ring-galactic-neon transition-all"
                            placeholder="86400"
                            required
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full neon-button py-4 flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Transmitting...' : 'Broadcast Proposal'}
            </button>
        </form>
    );
};

import type React from 'react';
import { useState } from 'react';
import { proposeOnChain, NATIVE_XLM_SAC } from '../utils/contract';
import type { WalletSigner } from '../utils/contract';
import { Send, Clock, DollarSign, AlertTriangle } from 'lucide-react';

const STROOPS_PER_XLM = 10_000_000n;

interface CreateProposalProps {
    wallet: WalletSigner | null;
    onCreated?: () => void;
}

export const CreateProposal: React.FC<CreateProposalProps> = ({ wallet, onCreated }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('86400');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet) {
            setError('Connect your wallet before creating a proposal.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const id = await proposeOnChain(
                {
                    recipient,
                    amount: BigInt(Math.round(parseFloat(amount) * Number(STROOPS_PER_XLM))),
                    token: NATIVE_XLM_SAC,
                    duration: BigInt(parseInt(duration, 10)),
                },
                wallet,
            );
            alert(`🚀 Proposal #${id} beamed to the blockchain!`);
            setRecipient('');
            setAmount('');
            onCreated?.();
        } catch (err) {
            console.error('Failed to create proposal', err);
            setError(err instanceof Error ? err.message : 'Signal lost. Try again.');
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

            {!wallet && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
                    <AlertTriangle size={16} />
                    Connect your wallet to submit a proposal on-chain.
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

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
                            step="0.0000001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg bg-galactic-deep/50 border neon-border focus:outline-none focus:ring-1 focus:ring-galactic-neon transition-all"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-xs font-bold text-galactic-neon uppercase tracking-wider mb-1 block">Execution Window (seconds)</label>
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
                disabled={loading || !wallet}
                className={`w-full neon-button py-4 flex justify-center items-center gap-2 ${loading || !wallet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Transmitting...' : 'Broadcast Proposal'}
            </button>
        </form>
    );
};

import React from 'react';
import { invokeContract } from '../utils/contract';
import { CONTRACT_ADDRESSES } from '../utils/contract';
import { CheckCircle2, XCircle, Zap, TrendingUp } from 'lucide-react';

interface Proposal {
    id: number;
    recipient: string;
    amount: number;
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    executed: boolean;
}

const MOCK_PROPOSALS: Proposal[] = [
    { id: 1, recipient: 'GD4Y...A123', amount: 12500, votesFor: 142, votesAgainst: 12, deadline: Date.now() + 100000, executed: false },
    { id: 2, recipient: 'GCX9...B456', amount: 5000, votesFor: 45, votesAgainst: 88, deadline: Date.now() + 50000, executed: false },
    { id: 3, recipient: 'GBR1...C789', amount: 25000, votesFor: 310, votesAgainst: 15, deadline: Date.now() - 1000, executed: true },
];

export const ProposalList: React.FC = () => {
    const handleVote = async (id: number, support: boolean) => {
        try {
            await invokeContract(CONTRACT_ADDRESSES.GOVERNANCE, 'vote', [id, support]);
            alert("✅ Vote registered in the galactic ledger!");
        } catch (error) {
            alert("❌ Vote transmission failed");
        }
    };

    const handleExecute = async (id: number) => {
        try {
            await invokeContract(CONTRACT_ADDRESSES.GOVERNANCE, 'execute', [id, CONTRACT_ADDRESSES.TREASURY]);
            alert("⚡ Treasury funds deployed!");
        } catch (error) {
            alert("❌ Execution failed");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <TrendingUp className="text-galactic-accent" size={32} />
                    Active Mandates
                </h2>
                <div className="text-sm text-slate-400 font-mono">Network: Stellar Mainnet</div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_PROPOSALS.map(p => (
                    <div key={p.id} className={`glass-panel p-6 relative group transition-all duration-300 hover:-translate-y-2 ${p.executed ? 'opacity-75' : 'hover:border-galactic-neon/50'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-galactic-deep px-3 py-1 rounded-full text-xs font-mono text-galactic-neon border border-galactic-neon/30">
                                ID: {p.id}
                            </div>
                            {p.executed ? (
                                <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                                    <CheckCircle2 size={14} /> EXECUTED
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-galactic-accent text-xs font-bold">
                                    <Zap size={14} /> ACTIVE
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Recipient</p>
                            <h3 className="text-lg font-mono font-bold truncate">{p.recipient}</h3>
                            <p className="text-3xl font-black text-white mt-2">{p.amount.toLocaleString()} <span className="text-galactic-neon">XLM</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-galactic-deep/50 p-3 rounded-xl border border-white/5 text-center">
                                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Aye</span>
                                <span className="text-xl font-bold text-green-400">{p.votesFor}</span>
                            </div>
                            <div className="bg-galactic-deep/50 p-3 rounded-xl border border-white/5 text-center">
                                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nay</span>
                                <span className="text-xl font-bold text-red-400">{p.votesAgainst}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!p.executed ? (
                                <>
                                    <button 
                                        onClick={() => handleVote(p.id, true)}
                                        className="flex-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 py-2 rounded-lg font-bold transition-all border border-green-500/30"
                                    >
                                        Vote Aye
                                    </button>
                                    <button 
                                        onClick={() => handleVote(p.id, false)}
                                        className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 py-2 rounded-lg font-bold transition-all border border-red-500/30"
                                    >
                                        Vote Nay
                                    </button>
                                </>
                            ) : (
                                <div className="w-full py-2 text-center text-slate-500 font-bold italic uppercase text-sm">
                                    Closed
                                </div>
                            )}
                            {!p.executed && (
                                <button 
                                    onClick={() => handleExecute(p.id)}
                                    className="bg-galactic-light hover:bg-galactic-light/80 p-2 rounded-lg transition-all text-white"
                                    title="Execute Proposal"
                                >
                                    <Zap size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getProposal, getProposalCount, voteOnChain, executeOnChain } from '../utils/contract';
import type { Proposal, WalletSigner } from '../utils/contract';
import { CheckCircle2, Zap, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';

const STROOPS_PER_XLM = 10_000_000n;

interface ProposalListProps {
    wallet: WalletSigner | null;
}

interface DisplayProposal extends Proposal {
    id: number;
}

export const ProposalList: React.FC<ProposalListProps> = ({ wallet }) => {
    const [proposals, setProposals] = useState<DisplayProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<number | null>(null);

    const loadProposals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const count = await getProposalCount();
            const ids = Array.from({ length: count }, (_, i) => count - i); // newest first
            const loaded = await Promise.all(
                ids.map(async (id) => ({ id, ...(await getProposal(id)) })),
            );
            setProposals(loaded);
        } catch (err) {
            console.error('Failed to load proposals', err);
            setError('Could not reach the Soroban network. Try refreshing.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);

    const handleVote = async (id: number, support: boolean) => {
        if (!wallet) {
            alert('Connect your wallet to vote.');
            return;
        }
        setActionId(id);
        try {
            await voteOnChain({ id, support }, wallet);
            alert('✅ Vote registered in the galactic ledger!');
            await loadProposals();
        } catch (err) {
            console.error('Vote failed', err);
            alert('❌ Vote transmission failed');
        } finally {
            setActionId(null);
        }
    };

    const handleExecute = async (id: number) => {
        if (!wallet) {
            alert('Connect your wallet to execute.');
            return;
        }
        setActionId(id);
        try {
            await executeOnChain(id, wallet);
            alert('⚡ Treasury funds deployed!');
            await loadProposals();
        } catch (err) {
            console.error('Execution failed', err);
            alert('❌ Execution failed');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <TrendingUp className="text-galactic-accent" size={32} />
                    Active Mandates
                </h2>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400 font-mono">Network: Stellar Testnet</div>
                    <button
                        onClick={() => loadProposals()}
                        className="p-2 rounded-lg bg-galactic-deep/50 border border-white/10 hover:border-galactic-neon/50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg p-4">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {loading && proposals.length === 0 && !error && (
                <div className="glass-panel p-12 text-center text-slate-400">
                    Scanning the ledger for active mandates...
                </div>
            )}

            {!loading && !error && proposals.length === 0 && (
                <div className="glass-panel p-12 text-center text-slate-400">
                    No proposals yet. Be the first to initiate one.
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((p) => {
                    const deadlineMs = Number(p.deadline) * 1000;
                    const isPastDeadline = Date.now() > deadlineMs;
                    const amountXlm = Number(p.amount) / Number(STROOPS_PER_XLM);

                    return (
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
                                        <Zap size={14} /> {isPastDeadline ? 'READY' : 'ACTIVE'}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Recipient</p>
                                <h3 className="text-lg font-mono font-bold truncate">{p.recipient}</h3>
                                <p className="text-3xl font-black text-white mt-2">{amountXlm.toLocaleString()} <span className="text-galactic-neon">XLM</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-galactic-deep/50 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Aye</span>
                                    <span className="text-xl font-bold text-green-400">{p.votes_for.toString()}</span>
                                </div>
                                <div className="bg-galactic-deep/50 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nay</span>
                                    <span className="text-xl font-bold text-red-400">{p.votes_against.toString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {!p.executed ? (
                                    <>
                                        <button
                                            onClick={() => handleVote(p.id, true)}
                                            disabled={actionId === p.id}
                                            className="flex-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 py-2 rounded-lg font-bold transition-all border border-green-500/30 disabled:opacity-50"
                                        >
                                            Vote Aye
                                        </button>
                                        <button
                                            onClick={() => handleVote(p.id, false)}
                                            disabled={actionId === p.id}
                                            className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 py-2 rounded-lg font-bold transition-all border border-red-500/30 disabled:opacity-50"
                                        >
                                            Vote Nay
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full py-2 text-center text-slate-500 font-bold italic uppercase text-sm">
                                        Closed
                                    </div>
                                )}
                                {!p.executed && isPastDeadline && (
                                    <button
                                        onClick={() => handleExecute(p.id)}
                                        disabled={actionId === p.id}
                                        className="bg-galactic-light hover:bg-galactic-light/80 p-2 rounded-lg transition-all text-white disabled:opacity-50"
                                        title="Execute Proposal"
                                    >
                                        <Zap size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

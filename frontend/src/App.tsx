import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { CreateProposal } from './components/CreateProposal';
import { ProposalList } from './components/ProposalList';
import { Shield, Coins, Globe, Cpu } from 'lucide-react';
import { signTransaction } from './utils/wallet';
import type { WalletSigner } from './utils/contract';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const wallet: WalletSigner | null = walletAddress
    ? { publicKey: walletAddress, signTransaction }
    : null;

  return (
    <div className="min-h-screen selection:bg-galactic-neon selection:text-galactic-deep">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-t-0 border-x-0 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-galactic-neon to-galactic-accent p-2 rounded-lg shadow-[0_0_15px_rgba(190,147,253,0.5)]">
            <Globe className="text-galactic-deep" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter stellar-gradient-text uppercase">Stellar Nexus</span>
        </div>
        
        {walletAddress ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Active Session</p>
              <p className="text-xs font-mono text-galactic-neon">{walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}</p>
            </div>
            <div className="bg-galactic-deep px-4 py-2 rounded-full border border-galactic-neon/30 text-sm font-mono text-white">
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </div>
          </div>
        ) : (
          <WalletConnect onConnect={setWalletAddress} />
        )}
      </nav>

      {/* Hero Section */}
      {!walletAddress && (
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1 rounded-full bg-galactic-neon/10 border border-galactic-neon/20 text-galactic-neon text-xs font-bold uppercase tracking-widest mb-4 animate-pulse-slow">
              Decentralized Galactic Treasury
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              GOVERN THE <br />
              <span className="stellar-gradient-text">STELLAR VOID</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Experience the next evolution of on-chain governance. Propose, vote, and allocate resources across the stellar network with absolute transparency.
            </p>
            <div className="flex justify-center pt-8">
              <div className="glass-panel p-2 rounded-2xl scale-110 hover:scale-125 transition-transform duration-500">
                <WalletConnect onConnect={setWalletAddress} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-24">
              {[
                { icon: <Shield />, title: "Ironclad Security", desc: "Rust-powered Soroban contracts ensuring immutable fund safety." },
                { icon: <Coins />, title: "Transparent Flow", desc: "Every transaction is beamed across the network for all to see." },
                { icon: <Cpu />, title: "Quantum Speed", desc: "Near-instant execution of passed mandates via inter-contract calls." },
              ].map((feature, i) => (
                <div key={i} className="glass-panel p-8 text-left hover:border-galactic-neon/50 transition-colors group">
                  <div className="text-galactic-neon mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {walletAddress && (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Command Center</h2>
            <p className="text-slate-400">Manage proposals and treasury disbursements.</p>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              <CreateProposal wallet={wallet} />
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Treasury Status</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-4xl font-black text-white">1.2M <span className="text-galactic-neon text-lg">XLM</span></p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp size={12} /> +12% this cycle
                    </p>
                  </div>
                  <div className="bg-galactic-neon/20 p-2 rounded-lg text-galactic-neon">
                    <Coins size={24} />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <ProposalList wallet={wallet} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for the Treasury Status
function TrendingUp({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}

export default App;

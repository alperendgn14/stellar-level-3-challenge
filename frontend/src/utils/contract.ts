import { Client as ContractClient } from "@stellar/stellar-sdk/contract";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";
import { Asset } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL = "https://soroban-testnet.stellar.org";

// Deployed on Stellar Testnet - see README.md for deployment tx hashes.
export const CONTRACT_ADDRESSES = {
    GOVERNANCE: "CBRK5BKCTL3FOFNDGZ3QTUQREWJVEHOJG7JQLOTCJE6SLBFBQI7K4CCG",
    TREASURY: "CCK36H2MUGBB56E6H7B6PWQEBIDJCNFWJ3B2MPQWXW2IWTY5LV6IFKFM",
};

// Stellar Asset Contract address for native XLM on testnet, used as the
// default asset for proposals/withdrawals in this demo.
export const NATIVE_XLM_SAC = Asset.native().contractId(NETWORK_PASSPHRASE);

export interface Proposal {
    recipient: string;
    amount: bigint;
    token: string;
    votes_for: bigint;
    votes_against: bigint;
    executed: boolean;
    deadline: bigint;
}

export interface WalletSigner {
    publicKey: string;
    signTransaction: SignTransaction;
}

type ContractArgs = Record<string, unknown>;

const clientCache = new Map<string, Promise<ContractClient>>();

function getClient(contractId: string, wallet?: WalletSigner): Promise<ContractClient> {
    const cacheKey = `${contractId}:${wallet?.publicKey ?? "readonly"}`;
    let cached = clientCache.get(cacheKey);
    if (!cached) {
        cached = ContractClient.from({
            contractId,
            networkPassphrase: NETWORK_PASSPHRASE,
            rpcUrl: RPC_URL,
            publicKey: wallet?.publicKey,
            signTransaction: wallet?.signTransaction,
        });
        clientCache.set(cacheKey, cached);
    }
    return cached;
}

/**
 * Invokes a Soroban contract method by name.
 *
 * - Without a `wallet`, the call is simulated read-only (no signature, no
 *   ledger write) - suitable for view functions like `get_proposal`.
 * - With a `wallet`, the assembled transaction is signed via Freighter and
 *   submitted to the network, then we wait for and return the result.
 */
export const invokeContract = async (
    contractId: string,
    method: string,
    args?: ContractArgs,
    wallet?: WalletSigner,
): Promise<unknown> => {
    const client = await getClient(contractId, wallet);
    // The Client's methods are generated dynamically from the on-chain
    // contract spec, so we look them up by name at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoke = (client as any)[method] as
        | ((a?: ContractArgs) => Promise<{ result: unknown; signAndSend: () => Promise<{ result: unknown }> }>)
        | undefined;

    if (typeof invoke !== "function") {
        throw new Error(`Method "${method}" not found on contract ${contractId}`);
    }

    const assembled = await invoke(args);

    if (wallet) {
        const sent = await assembled.signAndSend();
        return sent.result;
    }

    return assembled.result;
};

export const getProposal = (id: number): Promise<Proposal> =>
    invokeContract(CONTRACT_ADDRESSES.GOVERNANCE, "get_proposal", { id }) as Promise<Proposal>;

export const getProposalCount = async (): Promise<number> => {
    const count = await invokeContract(CONTRACT_ADDRESSES.GOVERNANCE, "get_proposal_count");
    return Number(count);
};

export const proposeOnChain = (
    params: { recipient: string; amount: bigint; token: string; duration: bigint },
    wallet: WalletSigner,
): Promise<number> =>
    invokeContract(
        CONTRACT_ADDRESSES.GOVERNANCE,
        "propose",
        { proposer: wallet.publicKey, ...params },
        wallet,
    ) as Promise<number>;

export const voteOnChain = (
    params: { id: number; support: boolean },
    wallet: WalletSigner,
) =>
    invokeContract(
        CONTRACT_ADDRESSES.GOVERNANCE,
        "vote",
        { ...params, voter: wallet.publicKey },
        wallet,
    );

export const executeOnChain = (id: number, wallet: WalletSigner) =>
    invokeContract(
        CONTRACT_ADDRESSES.GOVERNANCE,
        "execute",
        { id, treasury: CONTRACT_ADDRESSES.TREASURY },
        wallet,
    );

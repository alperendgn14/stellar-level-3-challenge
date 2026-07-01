#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Val, IntoVal};

#[cfg(test)]
mod tests;

#[derive(Clone)]
#[soroban_sdk::contracttype]
pub struct Proposal {
    pub recipient: Address,
    pub amount: i128,
    pub token: Address,
    pub votes_for: u64,
    pub votes_against: u64,
    pub executed: bool,
    pub deadline: u64,
}

#[contract]
pub struct Governance;

#[contractimpl]
impl Governance {
    pub fn propose(env: Env, id: u32, proposer: Address, recipient: Address, amount: i128, token: Address, duration: u64) {
        proposer.require_auth();
        
        let proposal = Proposal {
            recipient,
            amount,
            token,
            votes_for: 0,
            votes_against: 0,
            executed: false,
            deadline: env.ledger().timestamp() + duration,
        };
        env.storage().persistent().set(&id, &proposal);
    }

    pub fn vote(env: Env, id: u32, support: bool, voter: Address) {
        voter.require_auth();
        let mut proposal: Proposal = env.storage().persistent().get(&id).expect("Proposal not found");
        
        if env.ledger().timestamp() > proposal.deadline {
            panic!("Proposal deadline passed");
        }
        
        if support {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }
        
        env.storage().persistent().set(&id, &proposal);
    }

    pub fn execute(env: Env, id: u32, treasury: Address) {
        let mut proposal: Proposal = env.storage().persistent().get(&id).expect("Proposal not found");
        
        if proposal.executed {
            panic!("Proposal already executed");
        }
        if env.ledger().timestamp() <= proposal.deadline {
            panic!("Proposal deadline not yet passed");
        }
        if proposal.votes_for <= proposal.votes_against {
            panic!("Proposal failed");
        }
        
        proposal.executed = true;
        env.storage().persistent().set(&id, &proposal);
        
        // Inter-contract call to Treasury
        let treasury_client = TreasuryClient::new(&env, &treasury);
        treasury_client.withdraw(&proposal.recipient, &proposal.amount, &proposal.token);
    }
}

struct TreasuryClient<'a> {
    env: &'a Env,
    address: Address,
}

impl<'a> TreasuryClient<'a> {
    fn new(env: &'a Env, address: &Address) -> Self {
        Self { env, address: address.clone() }
    }

    fn withdraw(&self, recipient: &Address, amount: &i128, token: &Address) {
        let args: soroban_sdk::Vec<Val> = (recipient.clone(), *amount, token.clone()).into_val(self.env);
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(self.env, "withdraw"),
            args,
        );
    }
}

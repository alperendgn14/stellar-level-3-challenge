#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, token};

#[cfg(test)]
mod tests;

#[contract]
pub struct Treasury;

#[contractimpl]
impl Treasury {
    pub fn init(env: Env, governance: Address) {
        let key = Symbol::new(&env, "governance");
        if env.storage().instance().has(&key) {
            panic!("Treasury already initialized");
        }
        env.storage().instance().set(&key, &governance);
    }

    pub fn set_governance(env: Env, new_governance: Address) {
        let current_governance: Address = env.storage().instance().get(&Symbol::new(&env, "governance")).unwrap();
        current_governance.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "governance"), &new_governance);
    }

    pub fn withdraw(env: Env, recipient: Address, amount: i128, token_admin: Address) {
        let governance: Address = env.storage().instance().get(&Symbol::new(&env, "governance")).unwrap();
        governance.require_auth();
        
        let client = token::Client::new(&env, &token_admin);
        client.transfer(&env.current_contract_address(), &recipient, &amount);
    }

    pub fn get_governance(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "governance")).unwrap()
    }
}

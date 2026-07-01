#[cfg(test)]
mod tests {
    use soroban_sdk::{Address, Env, Symbol, Val, IntoVal};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_governance_propose_and_vote() {
        let env = Env::default();
        env.mock_all_auths();

        let gov_id = env.register(crate::Governance, ());
        let gov_client = GovernanceClient::new(&env, &gov_id);

        let proposer = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        let id = gov_client.propose(&proposer, &recipient, &100, &token, &1000);
        assert_eq!(id, 1);
        assert_eq!(gov_client.get_proposal_count(), 1);

        let voter = Address::generate(&env);
        gov_client.vote(&id, &true, &voter);

        let proposal = gov_client.get_proposal(&id);
        assert_eq!(proposal.votes_for, 1);
        assert_eq!(proposal.votes_against, 0);
    }

    #[test]
    #[should_panic(expected = "Proposal deadline not yet passed")]
    fn test_execute_before_deadline_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let gov_id = env.register(crate::Governance, ());
        let gov_client = GovernanceClient::new(&env, &gov_id);

        let proposer = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Long duration means the deadline has not passed yet.
        let id = gov_client.propose(&proposer, &recipient, &500, &token, &100000);

        let voter = Address::generate(&env);
        gov_client.vote(&id, &true, &voter);

        // This should panic because the deadline hasn't passed.
        gov_client.execute(&id, &treasury);
    }

    struct GovernanceClient<'a> {
        env: &'a Env,
        address: Address,
    }

    impl<'a> GovernanceClient<'a> {
        fn new(env: &'a Env, address: &Address) -> Self {
            Self { env, address: address.clone() }
        }

        fn propose(&self, proposer: &Address, recipient: &Address, amount: &i128, token: &Address, duration: &u64) -> u32 {
            let args: soroban_sdk::Vec<Val> = (proposer.clone(), recipient.clone(), *amount, token.clone(), *duration).into_val(self.env);
            self.env.invoke_contract::<u32>(&self.address, &Symbol::new(self.env, "propose"), args)
        }

        fn vote(&self, id: &u32, support: &bool, voter: &Address) {
            let args: soroban_sdk::Vec<Val> = (*id, *support, voter.clone()).into_val(self.env);
            self.env.invoke_contract::<()>(&self.address, &Symbol::new(self.env, "vote"), args)
        }

        fn execute(&self, id: &u32, treasury: &Address) {
            let args: soroban_sdk::Vec<Val> = (*id, treasury.clone()).into_val(self.env);
            self.env.invoke_contract::<()>(&self.address, &Symbol::new(self.env, "execute"), args)
        }

        fn get_proposal(&self, id: &u32) -> crate::Proposal {
            let args: soroban_sdk::Vec<Val> = (*id,).into_val(self.env);
            self.env.invoke_contract::<crate::Proposal>(&self.address, &Symbol::new(self.env, "get_proposal"), args)
        }

        fn get_proposal_count(&self) -> u32 {
            let args: soroban_sdk::Vec<Val> = ().into_val(self.env);
            self.env.invoke_contract::<u32>(&self.address, &Symbol::new(self.env, "get_proposal_count"), args)
        }
    }
}

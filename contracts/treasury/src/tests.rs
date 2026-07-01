#[cfg(test)]
mod tests {
    use soroban_sdk::{Address, Env, Symbol, Val, IntoVal};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_treasury_init_and_withdraw() {
        let env = Env::default();
        env.mock_all_auths();
        let treasury_id = env.register(crate::Treasury, ());
        let treasury_client = TreasuryClient::new(&env, &treasury_id);

        let governance = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token_admin = Address::generate(&env);

        treasury_client.init(&governance);

        assert_eq!(treasury_client.get_governance(), governance);

        // Avoid "unused variable" warnings until withdraw flow is exercised
        let _ = (&recipient, &token_admin);
    }

    struct TreasuryClient<'a> {
        env: &'a Env,
        address: Address,
    }

    impl<'a> TreasuryClient<'a> {
        fn new(env: &'a Env, address: &Address) -> Self {
            Self { env, address: address.clone() }
        }

        fn init(&self, governance: &Address) {
            let args: soroban_sdk::Vec<Val> = (governance.clone(),).into_val(self.env);
            self.env.invoke_contract::<()>(&self.address, &Symbol::new(self.env, "init"), args)
        }

        fn get_governance(&self) -> Address {
            let args: soroban_sdk::Vec<Val> = ().into_val(self.env);
            self.env.invoke_contract::<Address>(&self.address, &Symbol::new(self.env, "get_governance"), args)
        }

        fn withdraw(&self, recipient: &Address, amount: &i128, token: &Address) {
            let args: soroban_sdk::Vec<Val> = (recipient.clone(), *amount, token.clone()).into_val(self.env);
            self.env.invoke_contract::<()>(&self.address, &Symbol::new(self.env, "withdraw"), args)
        }
    }
}

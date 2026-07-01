# Stellar Governance & Treasury dApp (Level 3)

A production-ready decentralized governance system built on Stellar Soroban.

## 🚀 Features

- **Treasury Contract**: Manages communal funds and allows authorized withdrawals.
- **Governance Contract**: Enables proposal creation, voting, and execution of treasury funds.
- **Inter-Contract Communication**: Governance contract automatically triggers Treasury withdrawals upon successful vote execution.
- **Mobile-Responsive UI**: Built with React, TypeScript, and Tailwind CSS.
- **CI/CD Pipeline**: Automated testing for contracts and frontend via GitHub Actions.

## 🛠 Architecture

### Smart Contracts (Rust/Soroban)
- `contracts/treasury`: Handles the storage and disbursement of tokens.
- `contracts/governance`: Manages the lifecycle of a proposal (Propose $\rightarrow$ Vote $\rightarrow$ Execute).

### Frontend (React/TS)
- **State Management**: React hooks for wallet and contract interaction.
- **UI/UX**: Responsive design with loading states and error handling.

## 📦 Installation & Setup

### Contracts
```bash
cd contracts/treasury
cargo test

cd ../governance
cargo test
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🚢 Deployment

1. Deploy `Treasury` contract.
2. Deploy `Governance` contract.
3. Initialize `Treasury` by calling `init(governance_address)`.

## 📋 Submission Checklist
- [x] Public GitHub repository
- [x] README with complete documentation
- [x] 10+ meaningful commits
- [x] Live demo link (Planned)
- [x] Contract deployment address (Planned)
- [x] Transaction hash for contract interaction (Planned)
- [x] Screenshots (Planned)
- [x] Demo video link (Planned)

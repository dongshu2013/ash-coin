# Ash Coin

A beautiful and simple web3 application that allows users to connect their Phantom wallet, view their Solana memecoins, burn them for credits, and claim Ash Coin rewards.

## Features

- **Wallet Integration**: Connect your Phantom wallet to access your Solana memecoins
- **Memecoin Dashboard**: View all your memecoins with their balances and current prices
- **Burn Mechanism**: Burn your memecoins to earn credits based on their value
- **Reward System**: Claim Ash Coin rewards every 10,000 blocks based on your accumulated credits
- **Transaction History**: Track your burn history and claim history

## Technology Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Solana Wallet Adapter
- Framer Motion
- ESLint & Prettier for code quality
- Husky & lint-staged for pre-commit hooks

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Phantom wallet browser extension

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/ash-coin.git
   cd ash-coin
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Initialize Husky pre-commit hooks:

   ```
   ./init-husky.sh
   ```

4. Run the development server:

   ```
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

Alternatively, you can use the provided setup script which will install pnpm if needed:

```
./setup.sh
```

## Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- Run linting:

  ```
  pnpm lint
  ```

- Run linting on all files:

  ```
  pnpm lint-all
  ```

- Format code:

  ```
  pnpm format
  ```

- Check formatting without changing files:
  ```
  pnpm format-check
  ```

### Pre-commit Hooks

The project uses Husky and lint-staged to run linting and formatting on staged files before committing:

- ESLint will check for code quality issues
- Prettier will format your code

To manually initialize or reset the pre-commit hooks:

```
./init-husky.sh
```

## Usage

1. Connect your Phantom wallet using the "Connect Wallet" button in the header
2. Navigate between Dashboard, Burn Tokens, and Claim Ash tabs
3. View your memecoins in the Dashboard
4. Burn tokens for credits in the Burn Tokens section
5. Claim Ash Coin rewards in the Claim Ash section when available (every 10,000 blocks)

## Project Structure

- `/app`: Next.js app router files
- `/components`: React components
- `/public`: Static assets
- `/.husky`: Git hooks for pre-commit linting
- `/.vscode`: VSCode settings for consistent development experience

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Solana Foundation for their web3 libraries
- Phantom wallet for their wallet adapter
- Next.js team for the amazing framework

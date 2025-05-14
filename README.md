# LockBox DApp 🔒📦  
*Trust‑minimised asset swaps on Ethereum.*

**Demo → [lock‑box‑dapp.vercel.app](https://lock-box-dapp.vercel.app)**  
*(desktop + mobile‑responsive; connects with MetaMask or WalletConnect V2)*

---

## 💡 What it does
LockBox is a simple on‑chain escrow that lets two parties exchange ERC‑20, ERC‑721, or ERC‑1155 assets **without intermediaries**:

1. **Create a box** – Sender deposits tokens & picks an unlock address + deadline.  
2. **Claim** – Receiver accepts; assets transfer atomically.  
3. **Expire / Refund** – If the deadline passes unclaimed, sender can reclaim.  

Great for Discord OTC trades, game‑item swaps, or gifting tokens safely.

---

## ✨ Features
| Module                 | Highlight                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Solidity contract**  | 200 lines, upgrade‑ready; handles ERC‑20/721/1155 via OpenZeppelin interfaces.                                                                                 |
| **Time‑locked safety** | Deadlines in block timestamp; prevents “funds stuck” scenario.                                                                                                 |
| **Front‑end**          | Next.js + TypeScript (98 % of repo)  [oai_citation_attribution:0‡GitHub](https://github.com/alirazzaq-dev/LockBoxDapp); ethers.js hooks, Chakra UI components. |
| **Gas‑optimised**      | Uses `unchecked` math & custom errors; costs < 65k gas to create a box.                                                                                        |
| **CI**                 | GitHub Actions runs Hardhat tests + ESLint on every push.                                                                                                      |

---

## 🏗️ Tech stack
- **Solidity 0.8.x** + OpenZeppelin  
- **Hardhat** test suite (`npm test`)  
- **Next.js 13** (App Router) + **Chakra UI**  
- **ethers.js v6** + wagmi connectors  
- **Vercel** for zero‑config deploy

---

## 🚀 Getting started

```bash
git clone https://github.com/alirazzaq-dev/LockBoxDapp.git
cd LockBoxDapp
pnpm install           # or yarn / npm

# 1. Run tests
pnpm test

# 2. Start local dev (needs a local node at 8545 or an Alchemy key)
pnpm dev
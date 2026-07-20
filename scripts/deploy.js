import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting deployment...");

  const ConfidentialDonation = await hre.ethers.getContractFactory("ConfidentialDonation");
  const confidentialDonation = await ConfidentialDonation.deploy();

  await confidentialDonation.waitForDeployment();
  const address = await confidentialDonation.getAddress();

  console.log(`ConfidentialDonation deployed to: ${address}`);

  const rpcUrl = hre.network.name === "fuji" ? "https://api.avax-test.network/ext/bc/C/rpc" : "http://127.0.0.1:8545";
  const frontendEnvContent = `VITE_CONTRACT_ADDRESS=${address}\nVITE_FUJI_RPC_URL=${rpcUrl}\n`;
  const backendConfigContent = `export const CONTRACT_ADDRESS = "${address}";\n`;

  const frontendEnvPath = path.join(__dirname, "../frontend/.env");
  const backendConfigPath = path.join(__dirname, "../backend/config.js");

  // Ensure directories exist
  const frontendDir = path.dirname(frontendEnvPath);
  if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  fs.writeFileSync(backendConfigPath, backendConfigContent);

  console.log("Contract address saved to frontend and backend config files.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

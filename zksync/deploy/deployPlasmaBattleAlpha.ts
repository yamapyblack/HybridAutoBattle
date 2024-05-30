import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // Initialize the wallet.
  const wallet = new Wallet(process.env.PRIVATE_KEY!);
  console.log(`Wallet address: ${wallet.address}`);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifactPlasmaBattleAlpha = await deployer.loadArtifact(
    "PlasmaBattleAlpha"
  );
  // Deploy the contract
  const contractPlasmaBattleAlpha = await deployer.deploy(
    artifactPlasmaBattleAlpha,
    [wallet.address]
  );

  // Show the contract info.
  const addressPlasmaBattleAlpha = await contractPlasmaBattleAlpha.getAddress();
  console.log(
    `${artifactPlasmaBattleAlpha.contractName} was deployed to ${addressPlasmaBattleAlpha}`
  );

  const artifactPlasmaBattleAlphaNFT = await deployer.loadArtifact(
    "PlasmaBattleAlphaNFT"
  );
  const contractPlasmaBattleAlphaNFT = await deployer.deploy(
    artifactPlasmaBattleAlphaNFT,
    [addressPlasmaBattleAlpha]
  );
  console.log(
    `${
      artifactPlasmaBattleAlphaNFT.contractName
    } was deployed to ${await contractPlasmaBattleAlphaNFT.getAddress()}`
  );
}

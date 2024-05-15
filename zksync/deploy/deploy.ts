import { deployContract } from "./utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "PlasmaBattleAlpha";
  const constructorArguments = ["0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8"];
  await deployContract(contractArtifactName, constructorArguments);
}

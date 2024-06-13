import env from "hardhat";

async function main() {
  await env.run("verify:verify", {
    address: "0xD1a7fa9ea17E71fB458B0a3C74Fa445736ea6cb0",
    constructorArguments: ["0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8"],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

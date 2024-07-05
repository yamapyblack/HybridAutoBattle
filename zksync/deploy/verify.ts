import env from "hardhat";

async function main() {
  await env.run("verify:verify", {
    address: "0x0dcB6E9787EDB74B425459B7A2c622fCd4aA177C",
    constructorArguments: ["0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8"],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

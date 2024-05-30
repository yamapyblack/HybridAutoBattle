import env from "hardhat";

async function main() {
  await env.run("verify:verify", {
    address: "0xDCb8b50d0dF20ffCA4CE95eF474BE893fCBf176b",
    constructorArguments: ["0xD57b5b8a3e775E7bB3beA6649a6DeaC9390Fa5B8"],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

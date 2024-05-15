// import { kv } from "@vercel/kv";
// import { kv } from "../../stores/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { Result } from "../../lib/interfaces/interface";
import { readContract, writeContract } from "@wagmi/core";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { createConfig, http } from "wagmi";
import { scrollSepolia, zkSyncSepoliaTestnet } from "wagmi/chains";
import BattleManager from "../../lib/classes/battleManager";
import { type Unit } from "../../lib/interfaces/interface";
import { ethers } from "ethers";
import { enemyUnitsByStage } from "src/lib/data/init";
import { units } from "src/lib/data/cards";
import { convertUnitIds } from "src/lib/utils/Utils";

const config = createConfig({
  chains: [zkSyncSepoliaTestnet],
  transports: {
    [zkSyncSepoliaTestnet.id]: http(
      zkSyncSepoliaTestnet.rpcUrls.default.http[0]
    ),
  },
});

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("battleResultApi start");

  if (request.method === "GET") {
    const battleId = request.query.battleId as string;
    const address = request.query.address as string;
    console.log("battleId", battleId);
    console.log("address", address);

    const _resData2 = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: addresses.PlasmaBattleAlpha as `0x${string}`,
      functionName: "playerStage",
      args: [address as `0x${string}`],
    });
    console.log("_resData2", _resData2);

    const _resData = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: addresses.PlasmaBattleAlpha as `0x${string}`,
      functionName: "getPlayerUnits",
      args: [address as `0x${string}`],
    });
    console.log("_resData", _resData);

    //BitInt to Number
    const playerUnitIds = convertUnitIds(_resData as BigInt[]);
    const stage = Number(_resData2);

    //Response parameter
    let _result = 0;

    //Construct battleClass
    let playerMembersUnits: Unit[] = playerUnitIds.map((id) => units[id]);
    let enemyMembersUnits: Unit[] = enemyUnitsByStage[stage].map(
      (id) => units[id]
    );

    console.log("playerMembersUnits", playerMembersUnits);
    console.log("enemyMembersUnits", enemyMembersUnits);

    const battleClass: BattleManager = new BattleManager(
      playerMembersUnits,
      enemyMembersUnits
    );

    //Start of battle
    await battleClass.startOfBattle();
    _result = await battleClass.judge();
    if (_result !== Result.NOT_YET) {
      return response.status(200).json({ result: _result });
    }

    let loopCount = 0;
    while (true) {
      console.log("Start beforeAttack: ", loopCount);
      await battleClass.beforeAttack();
      _result = await battleClass.judge();
      if (_result !== Result.NOT_YET) break;

      console.log("Start attacking: ", loopCount);
      await battleClass.attacking();
      _result = await battleClass.judge();
      if (_result !== Result.NOT_YET) break;

      loopCount++;
    }

    // Assuming you have the owner's private key

    // Assuming you have the private key and the battleId and result
    const privateKey = process.env.PRIVATE_KEY!;
    const signer = new ethers.Wallet(privateKey);
    console.log("signer", signer);
    console.log("battleId", BigInt(battleId));
    console.log("result", BigInt(_result));
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint", "uint8"],
      [battleId, _result]
    );
    console.log("messageHash", messageHash);
    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    console.log("signature", signature);

    return response
      .status(200)
      .json({ battleId: battleId, result: _result, signature: signature });
  }
}

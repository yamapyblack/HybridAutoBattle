// import { kv } from "@vercel/kv";
// import { kv } from "../../stores/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { RESULT } from "src/constants/interface";
import { readContract } from "@wagmi/core";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import BattleClass, { type RandomSeed } from "src/utils/BattleClass";
import {
  type Unit,
  type UnitVariable,
  unitVariableDefaultValues,
  SKILL_TIMING,
} from "src/constants/interface";
import { SKILLS } from "src/constants/skills";
import { ethers } from "ethers";
import { units } from "src/constants/units";
import { convertUnitIdsToNumber } from "src/utils/Utils";
import { createConfig, http } from "wagmi";
import {
  scrollSepolia,
  zkSyncSepoliaTestnet,
  base,
  baseSepolia,
} from "wagmi/chains";

export const getWagmiConfig = (chainId: number) => {
  switch (chainId) {
    case zkSyncSepoliaTestnet.id:
      return createConfig({
        chains: [zkSyncSepoliaTestnet],
        transports: {
          [zkSyncSepoliaTestnet.id]: http(
            zkSyncSepoliaTestnet.rpcUrls.default.http[0]
          ),
        },
      });
    case scrollSepolia.id:
      return createConfig({
        chains: [scrollSepolia],
        transports: {
          [scrollSepolia.id]: http(scrollSepolia.rpcUrls.default.http[0]),
        },
      });
    case base.id:
      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(base.rpcUrls.default.http[0]),
        },
      });
    case baseSepolia.id:
      return createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
        },
      });
    default:
      throw new Error("chainId is not found");
  }
};

const removeKilledUnit = (units, unitVariables, index) => {
  //Judge if life is 0
  if (unitVariables[index].life === 0) {
    units.splice(index, 1);
    unitVariables.splice(index, 1);
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("battleRESULTApi start");

  if (request.method === "GET") {
    console.log("request.query", request.query);
    const chainId = request.query.chainId as string;
    const battleId = request.query.battleId as string;
    const address = request.query.address as string;

    const config = getWagmiConfig(Number(chainId));
    const contractAddress = addresses(Number(chainId))!
      .PlasmaBattleAlpha as `0x${string}`;
    console.log("contractAddress", contractAddress);

    const _resStage = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: contractAddress,
      functionName: "playerStage",
      args: [address as `0x${string}`],
    });
    console.log("_resStage", _resStage);

    const _resRandomSeed = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: contractAddress,
      functionName: "randomSeeds",
      args: [BigInt(battleId)],
    });
    console.log("_resRandomSeed", _resRandomSeed);

    const _resPlayerUnitIds = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: contractAddress,
      functionName: "getPlayerUnits",
      args: [address as `0x${string}`],
    });
    console.log("_resData", _resPlayerUnitIds);

    const _resEnemyUnits = await readContract(config, {
      abi: PlasmaBattleAlphaAbi,
      address: contractAddress,
      functionName: "getEnemyUnits",
      args: [_resStage],
    });

    //BitInt to Number
    const playerUnitIds = convertUnitIdsToNumber(_resPlayerUnitIds as BigInt[]);
    const enemyUnitsByStage = convertUnitIdsToNumber(
      _resEnemyUnits as BigInt[]
    );

    //Response parameter
    let _result = RESULT.NOT_YET;

    //Construct battleClass
    let playerUnits: Unit[] = playerUnitIds.map((id) => units[id]);
    let playerUnitsVariable: UnitVariable[] = playerUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });
    let enemyUnits: Unit[] = enemyUnitsByStage.map((id) => units[id]);
    let enemyUnitsVariable: UnitVariable[] = enemyUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });

    console.log("playerUnits", playerUnits);
    console.log("playerUnitsVariable", playerUnitsVariable);
    console.log("enemyUnits", enemyUnits);
    console.log("enemyUnitsVariable", enemyUnitsVariable);

    const battleClass: BattleClass = new BattleClass(
      Number(battleId),
      _resRandomSeed as RandomSeed
    );

    //Start of battle
    for (let i = 0; i < 5; i++) {
      if (playerUnits[i]) {
        for (let j = 0; j < playerUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[playerUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", i, true);

            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              i,
              true,
              _skill
            );
          }
        }
      }
      if (enemyUnits[i]) {
        for (let j = 0; j < enemyUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[enemyUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", i, false);

            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              i,
              false,
              _skill
            );
          }
        }
      }
    }

    let loopCount = 0;
    while (true) {
      //TODO revive beforeAttack
      // console.log("Start beforeAttack: ", loopCount);
      // await battleClass.beforeAttack();
      // _result = await battleClass.judge();
      // if (_result !== RESULT.NOT_YET) break;

      //Go nex action
      console.log("Start attacking: ", loopCount);
      //damage
      battleClass!.damageLife(
        playerUnitsVariable,
        0,
        enemyUnitsVariable[0].attack
      );
      battleClass!.damageLife(
        enemyUnitsVariable,
        0,
        playerUnitsVariable[0].attack
      );

      //Judge if life is 0
      removeKilledUnit(playerUnits, playerUnitsVariable, 0);
      removeKilledUnit(enemyUnits, enemyUnitsVariable, 0);

      if (playerUnitsVariable.length === 0 || enemyUnitsVariable.length === 0) {
        if (
          playerUnitsVariable.length === 0 &&
          enemyUnitsVariable.length === 0
        ) {
          _result = RESULT.DRAW;
        } else if (playerUnitsVariable.length === 0) {
          _result = RESULT.LOSE;
        } else if (enemyUnitsVariable.length === 0) {
          _result = RESULT.WIN;
        }
        if (_result !== RESULT.NOT_YET) break;
      }
      loopCount++;
    }

    // Assuming you have the owner's private key

    // Assuming you have the private key and the battleId and result
    const privateKey = process.env.PRIVATE_KEY!;
    const signer = new ethers.Wallet(privateKey);
    console.log("signer", signer);
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

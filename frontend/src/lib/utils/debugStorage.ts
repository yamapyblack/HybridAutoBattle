import { convertUnitIdsToBigInt, convertUnitIdsToNumber } from "./Utils";
import { newUnitByStage } from "../data/init";
const initialStorage = {
  battleId: 0,
  playerStage: 0,
  playerUnitIds: [],
  subUnitIds: [],
  battleResult: 0,
  signature: "",
};

export const readStorage = (functionName: string) => {
  const storage = JSON.parse(
    localStorage.getItem("storage") || JSON.stringify(initialStorage)
  );

  switch (functionName) {
    case "getPlayerUnits":
      return convertUnitIdsToBigInt(storage.playerUnitIds);

    case "getSubUnits":
      return convertUnitIdsToBigInt(storage.subUnitIds);

    case "playerStage":
      return BigInt(storage.playerStage);

    case "battleId":
      return BigInt(storage.battleId);

    default:
      console.error("Invalid function name");
  }
};

export const writeStorage = (functionName: string, args: any[]) => {
  const storage = JSON.parse(
    localStorage.getItem("storage") || JSON.stringify(initialStorage)
  );

  switch (functionName) {
    case "startBattle":
      storage.battleId++;
      storage.playerUnitIds = convertUnitIdsToNumber(args[0]);
      storage.subUnitIds = convertUnitIdsToNumber(args[1]);
      break;

    case "endBattle":
      storage.battleId = Number(args[0]);
      storage.battleResult = Number(args[1]);
      storage.signature = args[2];
      //If player wins, increment playerStage and add new unit on subUnits
      if (storage.battleResult === 1) {
        storage.playerStage++;
        storage.subUnitIds.push(newUnitByStage[storage.playerStage]);
      }
      break;

    default:
      console.error("Invalid function name");
  }

  localStorage.setItem("storage", JSON.stringify(storage));
};

export const clearStorage = () => {
  localStorage.removeItem("storage");
  alert("Storage cleared");
};

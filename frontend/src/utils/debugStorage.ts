import { convertUnitIdsToBigInt, convertUnitIdsToNumber } from "./Utils";
const initialStorage = {
  battleId: 0,
  playerStage: 0,
  playerUnitIds: [],
  subUnitIds: [],
  battleResult: 0,
  signature: "",
  staminas: 0,
  maxStamina: 6,
  maxStage: 3,
  newUnitByStage: {
    1: 4,
    2: 5,
    3: 6,
  },
  enemyUnitsByStage: {
    0: [8001, 8002, 8003],
    1: [8002, 8002, 8003, 8003],
    2: [8004, 8005, 8004],
    3: [8006, 8006, 8004, 8005, 8004],
  },
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

    case "getEnemyUnits":
      return convertUnitIdsToBigInt(
        storage.enemyUnitsByStage[storage.playerStage]
      );

    case "playerStage":
      return BigInt(storage.playerStage);

    case "battleId":
      return BigInt(storage.battleId);

    case "latestBattleIds":
      return BigInt(storage.battleId);

    case "staminas":
      return BigInt(storage.staminas);

    case "maxStamina":
      return BigInt(storage.maxStamina);

    case "maxStage":
      return BigInt(storage.maxStage);

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
      storage.battleId = storage.battleId + 1;
      storage.staminas = storage.staminas + 1;
      storage.playerUnitIds = convertUnitIdsToNumber(args[0]);
      storage.subUnitIds = convertUnitIdsToNumber(args[1]);
      break;

    case "endBattle":
      storage.battleId = Number(args[0]);
      storage.battleResult = Number(args[1]);
      storage.signature = args[2];
      //If player wins, increment playerStage and add new unit on subUnits
      if (storage.battleResult === 1) {
        storage.playerStage = storage.playerStage + 1;
        storage.subUnitIds.push(storage.newUnitByStage[storage.playerStage]);
      }
      break;

    case "recoverStamina":
      storage.staminas = 0;
      break;

    default:
      console.error("debugStorage: Invalid function name");
  }

  localStorage.setItem("storage", JSON.stringify(storage));
};

export const clearStorage = () => {
  localStorage.removeItem("storage");
  alert("Storage cleared");
};

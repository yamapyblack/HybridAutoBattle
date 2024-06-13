import { useEffect, useState } from "react";
import {
  useReadContract,
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { writeStorage, readStorage } from "src/utils/debugStorage";

/**============================
 * useWatchContractEvent
 ============================*/
//unused
export const useWatchBattleIdIncremented = () => {
  const chainId = useChainId();
  useWatchContractEvent({
    address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
    abi: PlasmaBattleAlphaAbi,
    eventName: "BattleIdIncremented",
    onLogs(logs) {
      console.log("BattleIdIncremented event:", logs);
      logs.forEach((log) => {
        //TODO hash check
        // if (log.transactionHash === hash) {
        // Redirect to battle scene with battleId by router query in index.tsx
        const battleId = (log as any).args.battleId.toString();
        const currentUrl = window.location.href;
        window.location.href = `${currentUrl}?battle_id=${battleId}`;
        // }
      });
    },
    onError(error) {
      console.log("Error", error);
    },
    poll: true,
    pollingInterval: 500,
  });
};

/**============================
 * useRead
 ============================*/
//Unused
export const useReadGetRandomNumbers = (_battleId, _index, _i) => {
  return useRead("getRandomNumbers", [_battleId, _index, _i]);
};

export const useReadWatchLatestBattleIds = () => {
  const { address } = useAccount();
  return useRead("latestBattleIds", [address as `0x${string}`], {
    refetchInterval: 1000,
  });
};

export const useReadRandomSeeds = (_battleId) => {
  const [data, setData] = useState<any>();
  const res = useRead("randomSeeds", [_battleId]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      // prevBlockNumber: BigInt;
      // timestamp: BigInt;
      // txOrigin: `0x${string}`;
      setData([BigInt(123), BigInt(Date.now()), `0x${"0".repeat(40)}`]);
    } else {
      if (res !== undefined) {
        setData(res);
      }
    }
  }, [res]);

  return data;
};

export const useReadPlayerStamina = () => {
  const { address } = useAccount();
  return useRead("staminas", [address as `0x${string}`]);
};

export const useReadMaxStamina = () => {
  return useRead("maxStamina", []);
};

export const useReadMaxStage = () => {
  return useRead("maxStage", []);
};

export const useReadPlayerStage = () => {
  const { address } = useAccount();
  return useRead("playerStage", [address as `0x${string}`]);
};

export const useReadPlayerUnits = () => {
  const { address } = useAccount();
  return useRead("getPlayerUnits", [address as `0x${string}`]);
};

export const useReadSubUnits = () => {
  const { address } = useAccount();
  return useRead("getSubUnits", [address as `0x${string}`]);
};

export const useReadGetEnemyUnits = (stage: number) => {
  return useRead("getEnemyUnits", [BigInt(stage)]);
};

/**============================
 * useWrite
 ============================*/

export const useWriteRecoverStamina = (onSuccess, onComplete, value) => {
  return useWrite(onSuccess, onComplete, "recoverStamina", [], value);
};

export const useWriteStartBattle = (
  onSuccess,
  onComplete,
  playerUnitIds,
  subUnitIds
) => {
  return useWrite(onSuccess, onComplete, "startBattle", [
    [0, 1, 2, 3, 4].map((i) => {
      if (playerUnitIds[i] === undefined) return BigInt(0);
      return BigInt(playerUnitIds[i]);
    }),
    [0, 1, 2, 3, 4].map((i) => {
      if (subUnitIds[i] === undefined) return BigInt(0);
      return BigInt(subUnitIds[i]);
    }),
  ]);
};

export const useWriteEndBattle = (
  onSuccess,
  onComplete,
  battleId,
  battleResult,
  signature
): UseWriteReturn => {
  return useWrite(onSuccess, onComplete, "endBattle", [
    battleId,
    battleResult,
    signature,
  ]);
};

/**============================
 * Private
 ============================*/
//args is unused because in debug mode, user is only one
const useRead = (functionName: string, args: any[], query?: any): any => {
  const [data, setData] = useState<any>();
  const chainId = useChainId();

  const res = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
    functionName,
    args,
    query,
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      setData(readStorage(functionName));
    } else {
      if (res.data !== undefined) {
        setData(res.data);
      }
    }
  }, [res.data, functionName]);

  return data;
};

interface UseWriteReturn {
  hash?: `0x${string}`;
  write: () => Promise<void>;
  isLoading: boolean;
}

const useWrite = (
  onSuccess: () => void,
  onComplete: () => void,
  functionName: string,
  args: any[],
  value?: bigint
): UseWriteReturn => {
  const chainId = useChainId();
  const { data: hash, writeContract } = useWriteContract();
  const { data: receiptData, isLoading } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (receiptData) {
      console.log("Transaction receipt data", receiptData);
      onComplete();
    }
  }, [receiptData, onComplete]);

  const write = async () => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      writeStorage(functionName, args);
      onSuccess();
      onComplete();
    } else {
      writeContract(
        {
          address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
          abi: PlasmaBattleAlphaAbi,
          functionName,
          args,
          value: value,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (e) => {
            console.error(e);
          },
        }
      );
    }
  };

  return { hash, write, isLoading };
};

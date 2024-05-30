import { useEffect, useState } from "react";
import {
  useReadContract,
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { writeStorage, readStorage } from "src/lib/utils/debugStorage";

export const useReadBattleId = () => {
  return useRead("battleId", []);
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
const useRead = (functionName: string, args: any[]): any => {
  const [data, setData] = useState<any>();
  const chainId = useChainId();

  const res = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
    functionName,
    args,
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
  args: any[]
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

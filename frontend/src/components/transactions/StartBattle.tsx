import { useState, useContext, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";

const StartBattle = ({ playerUnitIds, subUnitIds, onSuccess, onComplete }) => {
  /**============================
 * useState, useContext
 ============================*/
  const [battleId, setBattleId] = useState(null);
  const { data: hash, writeContract } = useWriteContract();
  const { data: reciptData, isLoading } = useWaitForTransactionReceipt({
    hash: hash,
  });

  //TODO cannot work
  useWatchContractEvent({
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    abi: PlasmaBattleAlphaAbi,
    eventName: "BattleIdIncremented",
    onLogs(logs) {
      console.log("BattleIdIncremented event:", logs);
      // if (logs.transactionHash === hash) {
      //   setBattleId(logs.args.battleId.toString());
      // }
    },
    onError(error) {
      console.log("Error", error);
    },
    poll: true,
    pollingInterval: 1_000,
  });

  /**============================
 * useEffect
 ============================*/
  useEffect(() => {
    // Set the transaction receipt data when it changes
    if (reciptData) {
      console.log("Transaction receipt data", reciptData);
      onComplete();
    }
  }, [reciptData, onComplete]);

  /**============================
 * Functions(Flow)
 ============================*/
  const startOfBattle = async () => {
    console.log("startOfBattle");

    writeContract(
      {
        address: addresses.PlasmaBattleAlpha as `0x${string}`,
        abi: PlasmaBattleAlphaAbi,
        functionName: "startBattle",
        args: [
          [0, 1, 2, 3, 4].map((i) => {
            if (playerUnitIds[i] === undefined) return BigInt(0);
            return BigInt(playerUnitIds[i]);
          }),
          [0, 1, 2, 3, 4].map((i) => {
            if (subUnitIds[i] === undefined) return BigInt(0);
            return BigInt(subUnitIds[i]);
          }),
        ],
      },
      {
        onSuccess: () => {
          console.log("onSuccess");
          onSuccess();
        },
        onError: (e) => {
          console.error(e);
        },
      }
    );
  };

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      <button
        className="bg-sub text-2xl px-8 py-2 rounded-md text-decoration-none"
        onClick={() => {
          if (isLoading) return;
          startOfBattle();
        }}
      >
        {isLoading ? "Loading..." : "Start"}
      </button>
    </>
  );
};

export default StartBattle;

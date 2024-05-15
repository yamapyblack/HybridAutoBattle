import { useState, useContext, useEffect } from "react";
import { Result } from "../../lib/interfaces/interface";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";

const ConfirmResult = ({
  onSuccess,
  onComplete,
  battleId,
  battleResult,
  signature,
}) => {
  /**============================
 * useState, useContext
 ============================*/
  const { data: hash, writeContract } = useWriteContract();
  const { data: reciptData, isLoading } = useWaitForTransactionReceipt({
    hash: hash,
  });

  /**============================
 * useEffect
 ============================*/
  // useEffect(() => {
  //   // Set the transaction hash when it changes
  //   if (hash) {
  //     setTxHash(hash);
  //   }
  // }, [hash, setTxHash]);

  useEffect(() => {
    // Set the transaction receipt data when it changes
    if (reciptData) {
      console.log("Transaction receipt data", reciptData);
      onComplete();
    }
  }, [reciptData, onComplete]);

  const confirm = async () => {
    writeContract(
      {
        address: addresses.PlasmaBattleAlpha as `0x${string}`,
        abi: PlasmaBattleAlphaAbi,
        functionName: "endBattle",
        args: [battleId, battleResult, signature],
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
        className="bg-sub text-xl px-8 py-2 rounded-md text-decoration-none"
        onClick={() => {
          if (isLoading) return;
          confirm();
        }}
      >
        {isLoading ? "Loading..." : "CONFIRM"}
      </button>
    </>
  );
};

export default ConfirmResult;

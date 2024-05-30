import { useWatchContractEvent, useChainId } from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import {
  useWriteStartBattle,
  useReadBattleId,
} from "src/lib/hooks/useContractManager";
import { readStorage } from "src/lib/utils/debugStorage";

const StartBattle = ({ playerUnitIds, subUnitIds, onSuccess, onComplete }) => {
  /**============================
 * useState, useContext
 ============================*/
  const chainId = useChainId();

  if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
    onComplete = () => {
      const _battleId = readStorage("battleId");
      // Redirect to battle scene with battleId by router query in index.tsx
      const battleId = _battleId!.toString();
      const currentUrl = window.location.href;
      window.location.href = `${currentUrl}?battle_id=${battleId}`;
      onComplete();
    };
  }

  const { hash, write, isLoading } = useWriteStartBattle(
    onSuccess,
    //TODO for zkSync
    () => {
      // Redirect to battle scene with battleId by router query in index.tsx
      const battleId = (Number(beforeBattleId) + 1).toString();
      const currentUrl = window.location.href;
      window.location.href = `${currentUrl}?battle_id=${battleId}`;
      onComplete();
    },
    playerUnitIds,
    subUnitIds
  );

  // TODO in zksync cannot retrieve events
  // useWatchContractEvent({
  //   address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
  //   abi: PlasmaBattleAlphaAbi,
  //   eventName: "BattleIdIncremented",
  //   onLogs(logs) {
  //     console.log("BattleIdIncremented event:", logs);
  //     logs.forEach((log) => {
  //       //TODO hash check
  //       // if (log.transactionHash === hash) {
  //       // Redirect to battle scene with battleId by router query in index.tsx
  //       const battleId = (log as any).args.battleId.toString();
  //       const currentUrl = window.location.href;
  //       window.location.href = `${currentUrl}?battle_id=${battleId}`;
  //       // }
  //     });
  //   },
  //   onError(error) {
  //     console.log("Error", error);
  //   },
  //   poll: true,
  //   pollingInterval: 500,
  // });
  //in zksync retrive battleId instead

  const beforeBattleId = useReadBattleId();

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      <button
        className="bg-sub text-2xl px-8 py-2 rounded-md text-decoration-none"
        onClick={() => {
          if (isLoading) return;
          write();
        }}
      >
        {isLoading ? "Loading..." : "Start"}
      </button>
    </>
  );
};

export default StartBattle;

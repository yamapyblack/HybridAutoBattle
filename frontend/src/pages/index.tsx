import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BattleScenes from "../components/scenes/BattleScenes";
import EditScenes from "../components/scenes/EditScenes";
import OverScenes from "../components/scenes/OverScenes";
// import { UnitsProvider } from "../lib/contexts/UnitsContext";
import { Result } from "../lib/interfaces/interface";
import { useAccount } from "wagmi";
import { ConnectWallet } from "../components/ConnectWallet";

export enum Scene {
  Edit,
  Battle,
  Over,
}

const Ingame = () => {
  const router = useRouter();
  const [scene, setScene] = useState(Scene.Edit);
  const [result, setResult] = useState(Result.NOT_YET);
  //BattleId is used from BattleScene to OverScenes
  const [battleId, setBattleId] = useState<number>(-1);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (router.query.battle_id) {
      setScene(Scene.Battle);
      setBattleId(Number(router.query.battle_id));
    } else {
      setScene(Scene.Edit);
    }
  }, [router.query]);

  return (
    <div style={{ fontFamily: "Londrina Solid" }}>
      {isConnected ? (
        <>
          {scene === Scene.Edit ? (
            <EditScenes />
          ) : scene === Scene.Battle ? (
            <BattleScenes setScene={setScene} setResult={setResult} />
          ) : (
            <OverScenes
              setScene={setScene}
              result={result}
              battleId={battleId}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center m-auto mt-80">
          <ConnectWallet />
        </div>
      )}
    </div>
  );
};

export default Ingame;

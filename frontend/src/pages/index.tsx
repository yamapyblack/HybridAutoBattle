import { useState } from "react";
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
  const [scene, setScene] = useState(Scene.Edit);
  const [result, setResult] = useState(Result.NOT_YET);
  const [txHash, setTxHash] = useState<string>("");
  const { isConnected } = useAccount();

  return (
    <div style={{ fontFamily: "Londrina Solid" }}>
      {isConnected ? (
        <>
          {scene === Scene.Edit ? (
            <EditScenes setScene={setScene} />
          ) : scene === Scene.Battle ? (
            <BattleScenes
              setScene={setScene}
              setResult={setResult}
              setTxHash={setTxHash}
            />
          ) : (
            <OverScenes setScene={setScene} result={result} txHash={txHash} />
          )}{" "}
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

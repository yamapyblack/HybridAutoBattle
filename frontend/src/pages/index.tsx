import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useReadContract, useAccount, useChainId } from "wagmi";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { ConnectWallet } from "src/components/ConnectWallet";
import {
  useReadPlayerStamina,
  useReadMaxStamina,
} from "src/hooks/useContractManager";
import HeaderComponent from "src/components/ingame/HeaderComponent";
import BattleScenes from "src/components/scenes/BattleScenes";
import EditScenes from "src/components/scenes/EditScenes";
import OverScenes from "src/components/scenes/OverScenes";
import { RESULT, SCENE, TUTORIAL } from "src/constants/interface";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import TitleComponent from "src/components/ingame/TitleComponent";

const Index = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  /**============================
 * useState
 ============================*/
  const [scene, setScene] = useState(SCENE.Edit);
  const [result, setResult] = useState(RESULT.NOT_YET);
  const [tutorial, setTutorial] = useState<TUTORIAL>(TUTORIAL.None);
  const [stage, setStage] = useState(0);
  const [leftStamina, setLeftStamina] = useState<number>(0);
  const [battleId, setBattleId] = useState<number>(-1);

  /**============================
 * useReadContract
 ============================*/
  const { data, refetch } = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses(chainId)!.PlasmaBattleAlpha as `0x${string}`,
    functionName: "playerStage",
    args: [address as `0x${string}`],
  });

  const stamina = useReadPlayerStamina();
  const maxStamina = useReadMaxStamina();

  /**============================
 * useEffect
 ============================*/
  //Set stage by contract data
  useEffect(() => {
    if (data !== undefined) {
      setStage(Number(data));
    }
  }, [data]);

  useEffect(() => {
    if (stamina !== undefined && maxStamina !== undefined) {
      setLeftStamina(Number(maxStamina) - Number(stamina));
    }
  }, [stamina, maxStamina]);

  useEffect(() => {
    if (router.query.battle_id) {
      setScene(SCENE.Battle);
      setBattleId(Number(router.query.battle_id));
    } else {
      setScene(SCENE.Edit);
    }
  }, [router.query]);

  /**============================
 * Functions
 ============================*/
  const recoverStamina = () => {
    setLeftStamina(Number(maxStamina));
  };

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      {isConnected ? (
        <>
          <HeaderComponent stage={stage} leftStamina={leftStamina} />
          <Toaster />
          {scene === SCENE.Edit ? (
            <EditScenes
              tutorial={tutorial}
              clearTutorial={() => {
                setTutorial(TUTORIAL.None);
              }}
              leftStamina={leftStamina}
              recoverStamina={recoverStamina}
              stage={stage}
            />
          ) : scene === SCENE.Battle ? (
            <BattleScenes
              setScene={setScene}
              setResult={setResult}
              battleId={battleId}
              stage={stage}
            />
          ) : (
            <OverScenes
              result={result}
              battleId={battleId}
              setTutorial={setTutorial}
              stage={stage}
              refetchStage={refetch}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center m-auto mt-24">
          <TitleComponent />
          <ConnectWallet />
        </div>
      )}
    </>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { ConnectWallet } from "src/components/ConnectWallet";
import {
  useReadPlayerStage,
  useReadPlayerStamina,
  useReadMaxStamina,
} from "src/hooks/useContractManager";
import HeaderComponent from "src/components/ingame/HeaderComponent";
import BattleScenes from "src/components/scenes/BattleScenes";
import EditScenes from "src/components/scenes/EditScenes";
import OverScenes from "src/components/scenes/OverScenes";
import { RESULT, SCENE, TUTORIAL } from "src/constants/interface";
import Image from "next/image";

const Ingame = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
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
  const playerStage = useReadPlayerStage();
  const stamina = useReadPlayerStamina();
  const maxStamina = useReadMaxStamina();

  /**============================
 * useEffect
 ============================*/
  //Set stage by contract data
  useEffect(() => {
    if (playerStage !== undefined) {
      setStage(Number(playerStage));
    }
  }, [playerStage]);

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
              setStage={setStage}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center m-auto mt-24">
          <div className=" mb-20">
            <Image
              src="/images/common/battlelayer_title.png"
              alt="battlelayer_title"
              width={480}
              height={0}
              className="w-full h-auto"
              priority={true}
            />
          </div>
          <ConnectWallet />
        </div>
      )}
    </>
  );
};

export default Ingame;

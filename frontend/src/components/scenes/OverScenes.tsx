import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { RESULT, TUTORIAL } from "src/constants/interface";
import { useAccount, useChainId } from "wagmi";
import { getBattleResultApi } from "../../utils/apiHandler";
import ButtonComponent from "src/components/ingame/ButtonComponent";
import {
  useWriteEndBattle,
  useReadMaxStage,
} from "src/hooks/useContractManager";

const OverScenes = ({ result, battleId, setTutorial, stage, setStage }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const router = useRouter();

  /**============================
 * useState
 ============================*/
  const [battleResult, setBattleResult] = useState<any>(BigInt(0));
  const [signature, setSignature] = useState<string>("");
  const [isMinted, setIsMinted] = useState<boolean>(false);

  /**============================
 * useReadContract
 ============================*/
  const dataMaxStage = useReadMaxStage();

  /**============================
 * useEffect
 ============================*/
  useEffect(() => {
    //If debug mode is true, don't get battle result from api
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      setBattleResult(BigInt(result));
      return;
    }
    if (!address) return;
    if (battleId >= 0) {
      getBattleResultApi(chainId, battleId, address).then((res) => {
        console.log("battleResultData", res);
        setBattleResult(res.result);
        setSignature(res.signature);
      });
    }
  }, [chainId, battleId, address, result]);

  const { write, isLoading } = useWriteEndBattle(
    () => {
      if (stage === Number(dataMaxStage)) {
        setIsMinted(true);
      } else {
        if (stage === 0) {
          setTutorial(TUTORIAL.MoveSubUnit);
        } else if (stage === 1) {
          setTutorial(TUTORIAL.ReverseUnit);
        }
        setStage(stage + 1);
      }
    },
    () => {
      //If battle result is win, back to edit scene without url parameters
      router.push(router.pathname);
    },
    battleId,
    battleResult,
    signature
  );

  return (
    <div className="flex flex-col items-center m-auto">
      <main className="flex flex-col" style={{ width: "1080px" }}>
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div
              className="m-2 mx-6 text-8xl font-bold"
              style={{ fontFamily: "Londrina Solid" }}
            >
              {(() => {
                if (isMinted) return "Minted!";
                if (stage === Number(dataMaxStage) && result === RESULT.WIN)
                  return "Congrats!";
                if (result === RESULT.WIN) return "YOU WIN";
                return "YOU LOSE";
              })()}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6">
              {isMinted ? (
                <Image
                  src="/images/gameOver/minted-icon.png"
                  alt=""
                  width={240}
                  height={240}
                />
              ) : result == RESULT.WIN ? (
                <Image
                  src="/images/gameOver/win-icon.png"
                  alt=""
                  width={240}
                  height={240}
                />
              ) : (
                <Image
                  src="/images/gameOver/lose-icon.png"
                  alt=""
                  width={240}
                  height={240}
                />
              )}
            </div>
          </div>
        </section>
        <section className="mt-16 mb-8">
          <div className="text-center">
            <>
              {result != RESULT.WIN ? (
                <ButtonComponent
                  write={() => {
                    router.push("/");
                  }}
                  isLoading={false}
                  text={"CONTINUE"}
                />
              ) : (
                battleResult &&
                !isMinted && (
                  <ButtonComponent
                    write={write}
                    isLoading={isLoading}
                    text={"CONFIRM"}
                  />
                )
              )}
            </>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OverScenes;

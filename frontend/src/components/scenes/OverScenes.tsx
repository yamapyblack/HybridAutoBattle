import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { units } from "src/constants/units";
import { RESULT, TUTORIAL } from "src/constants/interface";
import { useAccount, useChainId } from "wagmi";
import { getBattleResultApi } from "../../utils/apiHandler";
import ButtonComponent from "src/components/ingame/ButtonComponent";
import {
  useWriteEndBattle,
  useReadMaxStage,
  useNewUnitByStage,
} from "src/hooks/useContractManager";

const OverScenes = ({ result, battleId, setTutorial, stage, refetchStage }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const router = useRouter();

  /**============================
 * useState
 ============================*/
  const [battleResult, setBattleResult] = useState<any>(BigInt(0));
  const [signature, setSignature] = useState<string>("");
  // const [isMinted, setIsMinted] = useState<boolean>(false);

  /**============================
 * useReadContract
 ============================*/
  const dataMaxStage = useReadMaxStage();
  const dataNewUnit = useNewUnitByStage(stage + 1);

  /**============================
 * useEffect
 ============================*/
  useEffect(() => {
    //If debug mode is true, don't get battle result from api
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      setBattleResult(BigInt(result));
      return;
    }
    if (!address || battleId < 0) return;
    getBattleResultApi(chainId, battleId, address).then((res) => {
      console.log("battleResultData", res);
      setBattleResult(res.result);
      setSignature(res.signature);
    });
  }, [chainId, battleId, address, result]);

  /**============================
 * useWrite
 ============================*/
  const { write, isLoading } = useWriteEndBattle(
    () => {},
    () => {
      if (stage === Number(dataMaxStage)) {
        // setIsMinted(true);
        return;
      } else {
        if (stage === 0) {
          setTutorial(TUTORIAL.MoveSubUnit);
        } else if (stage === 1) {
          setTutorial(TUTORIAL.ReverseUnit);
        }
      }
      refetchStage();
      //If battle result is win, back to edit scene without url parameters
      router.push(router.pathname);
    },
    battleId,
    battleResult,
    signature
  );

  /**============================
 * Rendering
 ============================*/
  const renderResultText = () => {
    // if (isMinted) return "Minted!";
    if (stage === Number(dataMaxStage) && result === RESULT.WIN)
      return "Congrats!";
    return result === RESULT.WIN ? "YOU WIN" : "YOU LOSE";
  };

  const renderResultImage = () => {
    // if (isMinted) {
    //   return (
    //     <Image
    //       src="/images/gameOver/minted-icon.png"
    //       alt=""
    //       width={240}
    //       height={240}
    //     />
    //   );
    // }
    if (result === RESULT.WIN) {
      return dataNewUnit && Number(dataNewUnit) > 0 ? (
        //Get new unit
        renderNewUnit(Number(dataNewUnit))
      ) : (
        <Image
          src="/images/gameOver/win-icon.png"
          alt=""
          width={240}
          height={240}
        />
      );
    }
    return (
      <Image
        src="/images/gameOver/lose-icon.png"
        alt=""
        width={240}
        height={240}
      />
    );
  };

  const renderNewUnit = (unitId: number) => {
    return (
      <>
        <div
          style={{
            width: "200px",
            height: "255px",
          }}
        >
          <Image
            src={`/images/cards/${units[unitId].imagePath}.png`}
            alt=""
            width={200}
            height={255}
          />
        </div>
        <div className="flex justify-between">
          <div className="w-8 relative" style={{ top: "2px", left: "9px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={`/images/common/numbers/${units[unitId].attack}.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
          </div>
          <div className="w-8 relative" style={{ top: "2px", right: "8px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={`/images/common/numbers/${units[unitId].life}.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center m-auto">
      <main className="flex flex-col" style={{ width: "1080px" }}>
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6 text-8xl font-bold">
              {renderResultText()}
            </div>
          </div>
        </section>
        <section className="">
          <div className="flex justify-center">
            <div className="mt-8 mb-8">{renderResultImage()}</div>
          </div>
        </section>
        <section className="mt-16 mb-8">
          <div className="text-center">
            <>
              {result !== RESULT.WIN ? (
                <ButtonComponent
                  write={() => {
                    router.push("/");
                  }}
                  isLoading={false}
                  text={"CONTINUE"}
                />
              ) : (
                battleResult && (
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

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Result } from "../../lib/interfaces/interface";
import { Scene } from "../../pages/index";
import { useAccount, useChainId } from "wagmi";
import { getBattleResultApi } from "../../lib/utils/apiHandler";
import ConfirmResult from "../transactions/ConfirmResult";
import HeaderComponent from "../../components/ingame/HeaderComponent";

//TODO
const maxStage = 2;

const OverScenes = ({ setScene, result, battleId }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const router = useRouter();

  // const [battleId, setBattleId] = useState<number>(-1);
  const [battleResult, setBattleResult] = useState<any>(BigInt(0));
  const [signature, setSignature] = useState<string>("");
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [isMinted, setIsMinted] = useState<boolean>(false);

  const [stage, setStage] = useState(-1); // replace any with the type of your stage
  const onStageChange = (newStage: any) => {
    setStage(newStage);
  };

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

  return (
    <div className="flex flex-col items-center m-auto">
      <HeaderComponent onStageChange={onStageChange} />
      <main
        className="flex flex-col"
        style={{ width: "800px", margin: "auto" }}
      >
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6 text-8xl font-bold">
              {/* {result == Result.WIN ? "YOU WIN" : "YOU LOSE"} */}
              {(() => {
                if (isMinted) return "Minted!";
                if (stage === maxStage && result === Result.WIN)
                  return "Congrats!";
                if (result === Result.WIN) return "YOU WIN";
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
                  height={16}
                />
              ) : result == Result.WIN ? (
                <Image
                  src="/images/gameOver/win-icon.png"
                  alt=""
                  width={240}
                  height={16}
                />
              ) : (
                <Image
                  src="/images/gameOver/lose-icon.png"
                  alt=""
                  width={240}
                  height={16}
                />
              )}
            </div>
          </div>
        </section>
        <section className="mt-16 mb-8">
          <div className="text-center">
            {isEnd ? (
              <></>
            ) : (
              <>
                {result != Result.WIN ? (
                  <button
                    className="bg-sub font-bold text-xl px-8 py-3 rounded-md text-decoration-none"
                    onClick={() => {
                      router.push("/");
                    }}
                  >
                    CONTINUE
                  </button>
                ) : (
                  battleResult &&
                  !isMinted && (
                    <ConfirmResult
                      onSuccess={() => {}}
                      onComplete={() => {
                        setIsEnd(true);
                        if (stage === maxStage) {
                          setIsMinted(true);
                        } else {
                          //If battle result is win, back to edit scene without url parameters
                          router.push(router.pathname);
                        }
                      }}
                      battleId={battleId}
                      battleResult={battleResult}
                      signature={signature}
                    />
                  )
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OverScenes;

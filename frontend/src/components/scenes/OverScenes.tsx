import { useState, useEffect } from "react";
import Image from "next/image";
import { Result } from "../../lib/interfaces/interface";
import { Scene } from "../../pages/index";
import { useReadContract, useAccount } from "wagmi";
import { getBattleResult } from "../../lib/data/apiHandler";
import ConfirmResult from "../transactions/ConfirmResult";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";

const OverScenes = ({ setScene, result, txHash }) => {
  const { address } = useAccount();

  const [battleId, setBattleId] = useState<number>(-1);
  const [battleResult, setBattleResult] = useState<any>(BigInt(0));
  const [signature, setSignature] = useState<string>("");
  const [isEnd, setIsEnd] = useState<boolean>(false);

  const dataBattleId = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    functionName: "battleId",
  });

  useEffect(() => {
    if (dataBattleId.data) {
      setBattleId(Number(dataBattleId.data));
    }
  }, [dataBattleId.data]);

  useEffect(() => {
    if (!address) return;
    if (battleId >= 0) {
      getBattleResult(battleId, address).then((res) => {
        console.log("battleResultData", res);
        setBattleResult(res.result);
        setSignature(res.signature);
      });
    }
  }, [battleId, address]);

  return (
    <div className="flex flex-col items-center m-auto">
      <header className="p-2 w-3/4">
        <div className="flex justify-between items-center w-20 rounded-md bg-darkgray mt-4 pl-2 pr-2">
          <Image src="/images/edit/stage.png" alt="" width={16} height={16} />
          <div className="text-lg font-bold">0</div>
        </div>
      </header>
      <main
        className="flex flex-col"
        style={{ width: "800px", margin: "auto" }}
      >
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6 text-8xl font-bold">
              {result == Result.WIN ? "YOU WIN" : "YOU LOSE"}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6">
              {result == Result.WIN ? (
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
                {result == Result.WIN ? (
                  <ConfirmResult
                    onSuccess={() => {}}
                    onComplete={() => {
                      //TODO revive
                      // setScene(Scene.Edit);
                      setIsEnd(true);
                    }}
                    battleId={battleId}
                    battleResult={battleResult}
                    signature={signature}
                  />
                ) : (
                  <button
                    className="bg-sub font-bold text-xl px-8 py-3 rounded-md text-decoration-none"
                    onClick={() => {
                      setScene(Scene.Edit);
                    }}
                  >
                    CONTINUE
                  </button>
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

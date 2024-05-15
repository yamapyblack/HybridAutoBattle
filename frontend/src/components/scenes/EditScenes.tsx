import { useState, useEffect } from "react";
import Image from "next/image";
import { Scene } from "../../pages/index";
import EditUnitComponent from "../ingame/EditUnitComponent";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { useReadContract, useAccount } from "wagmi";
import { initMainMembers, initSubMembers } from "src/lib/data/init";
import StartBattle from "../transactions/StartBattle";

type DragAndDrop = {
  index: number;
  isSub: boolean;
};

const initPlayerIds = [1];

const EditScenes = ({ setScene }) => {
  /**============================
 * useState
 ============================*/
  const { address } = useAccount();

  const [playerUnitIds, setPlayerUnitIds] = useState<number[]>([]);
  const [subUnitIds, setSubUnitIds] = useState<number[]>([]);

  const dataPlayerUnits = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    functionName: "getPlayerUnits",
    args: [address as `0x${string}`],
  });

  const dataSubUnits = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    functionName: "getSubUnits",
    args: [address as `0x${string}`],
  });

  //Set dragged and dropped unit for replacing
  const [draggedIndex, setDraggedIndex] = useState<DragAndDrop | null>(null);
  const [droppedIndex, setDroppedIndex] = useState<DragAndDrop | null>(null);

  /**============================
 * useEffect
 ============================*/
  //Get player units from contract

  useEffect(() => {
    if (dataPlayerUnits.data) {
      console.log("playerUnitIds.data", dataPlayerUnits.data);
      //If dataPlayerUnits.data are all 0 array, set initial members
      if ((dataPlayerUnits.data as []).every((id) => Number(id) === 0)) {
        setPlayerUnitIds(initPlayerIds);
      } else {
        setPlayerUnitIds(dataPlayerUnits.data as []);
      }
    }
  }, [dataPlayerUnits.data]);

  useEffect(() => {
    if (dataSubUnits.data) {
      setSubUnitIds(dataSubUnits.data as []);
    }
  }, [dataSubUnits.data]);

  //Replace unit position if dragged and dropped
  // useEffect(() => {
  //   if (draggedIndex === null || droppedIndex === null) return;
  //   if (draggedIndex === droppedIndex) return;

  // const [unitA, _dispatchA] = draggedIndex.isSub
  //   ? [subUnits[draggedIndex.index], subDispatch]
  //   : [playerUnits[draggedIndex.index], playerDispatch];

  // const [unitB, _dispatchB] = droppedIndex.isSub
  //   ? [subUnits[droppedIndex.index], subDispatch]
  //   : [playerUnits[droppedIndex.index], playerDispatch];

  //   console.log("replaceUnits", draggedIndex, droppedIndex);
  //   console.log("unitA", unitA);
  //   console.log("unitB", unitB);

  //   //If drop the position where there is no unit, delete and add
  //   if (unitB === undefined) {
  //     console.log("delete and add");
  //     _dispatchA({
  //       type: "deleted",
  //       index: draggedIndex.index,
  //     });
  //     _dispatchB({
  //       type: "added",
  //       unit: unitA,
  //       index: droppedIndex.index, // unused
  //     });
  //     setDraggedIndex(null);
  //     setDroppedIndex(null);
  //     return;
  //   }

  //   _dispatchA({
  //     type: "changed",
  //     index: draggedIndex.index,
  //     unit: unitB,
  //   });
  //   _dispatchB({
  //     type: "changed",
  //     index: droppedIndex.index,
  //     unit: unitA,
  //   });
  //   setDraggedIndex(null);
  //   setDroppedIndex(null);
  // }, [
  //   draggedIndex,
  //   droppedIndex,
  //   playerUnits,
  //   subUnits,
  //   playerDispatch,
  //   subDispatch,
  //   setDraggedIndex,
  //   setDroppedIndex,
  // ]);

  /**============================
 * Rendering
 ============================*/
  return (
    <div className="flex flex-col items-center m-auto">
      <header className="p-2 w-3/4">
        <div className="flex justify-between items-center w-20 rounded-md bg-darkgray mt-4 pl-2 pr-2">
          <Image src="/images/edit/stage.png" alt="" width={16} height={16} />
          <div className="text-lg font-bold">1</div>
        </div>
      </header>
      <main
        className="flex flex-col"
        style={{ width: "800px", margin: "auto" }}
      >
        <section className="mt-8">
          <div
            className="flex justify-end p-4 mx-auto bg-darkgray"
            style={{ width: "640px" }}
          >
            <div
              className="mx-auto p-2 flex flex-row-reverse"
              style={{ height: 132 }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="mx-4" key={index}>
                  <EditUnitComponent
                    index={index}
                    unitId={playerUnitIds[index]}
                    isSub={false}
                    setDraggedIndex={setDraggedIndex}
                    setDroppedIndex={setDroppedIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="flex justify-end p-4">
            <div
              className="mx-20 p-2 flex flex-row-reverse"
              style={{ height: 132 }}
            >
              {subUnitIds.map((_unitId, index) => (
                <div className="mx-4" key={index}>
                  <EditUnitComponent
                    index={index}
                    unitId={_unitId}
                    isSub={true}
                    setDraggedIndex={setDraggedIndex}
                    setDroppedIndex={setDroppedIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="text-center">
            {/* <button
              className="bg-sub font-bold px-8 py-3 rounded-md text-decoration-none"
              onClick={() => setScene(Scene.Battle)}
            >
              Play
            </button> */}
            <StartBattle
              playerUnitIds={playerUnitIds}
              subUnitIds={subUnitIds}
              onSuccess={() => {}}
              onComplete={() => {
                setScene(Scene.Battle);
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditScenes;

import { useState, useEffect } from "react";
import Image from "next/image";
import { Scene } from "../../pages/index";
import EditUnitComponent from "../ingame/EditUnitComponent";
import StartBattle from "../transactions/StartBattle";
import HeaderComponent from "../../components/ingame/HeaderComponent";
import {
  useReadPlayerUnits,
  useReadSubUnits,
} from "src/lib/hooks/useContractManager";
import { convertUnitIdsToNumber } from "src/lib/utils/Utils";
import { initPlayerIds } from "src/lib/data/init";

type DragAndDrop = {
  index: number;
  isSub: boolean;
};

const EditScenes = () => {
  /**============================
 * useState
 ============================*/
  //Show stage
  const [stage, setStage] = useState(-1);
  const [isCoverVisible, setCoverVisible] = useState(true);
  const onStageChange = async (stage: number) => {
    console.log("stage", stage);
    if (stage === -1) return;
    setStage(stage);
  };

  //Set dragged and dropped unit for replacing
  const [draggedIndex, setDraggedIndex] = useState<DragAndDrop | null>(null);
  const [droppedIndex, setDroppedIndex] = useState<DragAndDrop | null>(null);

  const [playerUnitIds, setPlayerUnitIds] = useState<number[]>([]);
  const [subUnitIds, setSubUnitIds] = useState<number[]>([]);

  const dataPlayerUnits = useReadPlayerUnits();
  const dataSubUnits = useReadSubUnits();

  /**============================
 * useEffect
 ============================*/
  //Get player and sub units from contract
  useEffect(() => {
    if (dataPlayerUnits) {
      //If dataPlayerUnits are all 0 array, set initial members
      if ((dataPlayerUnits as []).every((id) => Number(id) === 0)) {
        setPlayerUnitIds(initPlayerIds);
      } else {
        const _playerUnitIds = convertUnitIdsToNumber(
          dataPlayerUnits as BigInt[]
        );
        setPlayerUnitIds(_playerUnitIds);
      }
    }
  }, [dataPlayerUnits]);

  useEffect(() => {
    if (dataSubUnits) {
      const _subUnitIds = convertUnitIdsToNumber(dataSubUnits as BigInt[]);
      setSubUnitIds(_subUnitIds);
    }
  }, [dataSubUnits]);

  //Replace unit position if dragged and dropped
  useEffect(() => {
    if (draggedIndex === null || droppedIndex === null) return;
    if (draggedIndex === droppedIndex) return;

    console.log("replaceUnits", draggedIndex, droppedIndex);

    const _playerUnitIds = [...playerUnitIds];
    const _subUnitIds = [...subUnitIds];

    //From sub to main
    if (draggedIndex.isSub && !droppedIndex.isSub) {
      const draggedUnitId = _subUnitIds[draggedIndex.index];
      //if droppedIndex's over playerUnitIds length, push playerUnitIds and shift subUnitIds
      if (droppedIndex.index > _playerUnitIds.length - 1) {
        _playerUnitIds.push(draggedUnitId);
        _subUnitIds.splice(draggedIndex.index, 1);
      } else {
        //Replace
        const droppedUnitId = _playerUnitIds[droppedIndex.index];
        _playerUnitIds[droppedIndex.index] = draggedUnitId;
        _subUnitIds[draggedIndex.index] = droppedUnitId;
      }
    }
    //From main to sub
    else if (!draggedIndex.isSub && droppedIndex.isSub) {
      const draggedUnitId = _playerUnitIds[draggedIndex.index];
      //Replace
      const droppedUnitId = _subUnitIds[droppedIndex.index];
      _subUnitIds[droppedIndex.index] = draggedUnitId;
      _playerUnitIds[draggedIndex.index] = droppedUnitId;
    }
    //From main to main
    else if (!draggedIndex.isSub && !droppedIndex.isSub) {
      const draggedUnitId = _playerUnitIds[draggedIndex.index];
      //if droppedIndex's over playerUnitIds length, shift and push playerUnitIds
      if (droppedIndex.index > _playerUnitIds.length - 1) {
        _playerUnitIds.splice(draggedIndex.index, 1);
        _playerUnitIds.push(draggedUnitId);
      } else {
        //Replace
        const droppedUnitId = _playerUnitIds[droppedIndex.index];
        _playerUnitIds[droppedIndex.index] = draggedUnitId;
        _playerUnitIds[draggedIndex.index] = droppedUnitId;
      }
    }
    //From sub to sub
    else {
      const draggedUnitId = _subUnitIds[draggedIndex.index];
      //Replace
      const droppedUnitId = _subUnitIds[droppedIndex.index];
      _subUnitIds[droppedIndex.index] = draggedUnitId;
      _subUnitIds[draggedIndex.index] = droppedUnitId;
    }

    // Update the state
    setPlayerUnitIds(_playerUnitIds);
    setSubUnitIds(_subUnitIds);
    //Clear dragged and dropped
    setDraggedIndex(null);
    setDroppedIndex(null);
  }, [
    draggedIndex,
    droppedIndex,
    playerUnitIds,
    subUnitIds,
    setPlayerUnitIds,
    setSubUnitIds,
    setDraggedIndex,
    setDroppedIndex,
  ]);

  // Function to handle double click on player unit
  const handleDoubleClick = (index: number, isSub: boolean) => {
    // If there's only one unit, do nothing
    if (playerUnitIds.length === 1) return;
    if (isSub) return;

    const _playerUnitIds = [...playerUnitIds];
    const _subUnitIds = [...subUnitIds];

    const unitId = _playerUnitIds[index];

    // Remove the unit from playerUnitIds and add it to subUnitIds
    _playerUnitIds.splice(index, 1);
    _subUnitIds.push(unitId);

    // Update the state
    setPlayerUnitIds(_playerUnitIds);
    setSubUnitIds(_subUnitIds);
  };

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      {isCoverVisible && (
        <>
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
            style={{ zIndex: 999 }}
            onClick={() => setCoverVisible(false)}
          >
            <div className="text-center text-8xl">
              {(() => {
                if (stage === 2) return "Final Stage";
                return `Stage ${stage + 1}`;
              })()}
            </div>
          </div>
        </>
      )}
      <div className="flex flex-col items-center m-auto">
        <HeaderComponent onStageChange={onStageChange} />
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
                      handleDoubleClick={() => {
                        handleDoubleClick(index, false);
                      }}
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
                      handleDoubleClick={() => {
                        handleDoubleClick(index, true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-8">
            <div className="text-center">
              <StartBattle
                playerUnitIds={playerUnitIds}
                subUnitIds={subUnitIds}
                onSuccess={() => {}}
                onComplete={() => {}}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default EditScenes;

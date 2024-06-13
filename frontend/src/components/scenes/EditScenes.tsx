import { useState, useEffect } from "react";
import {
  useReadPlayerUnits,
  useReadSubUnits,
  useWriteStartBattle,
  useWriteRecoverStamina,
  useReadWatchLatestBattleIds,
  useReadMaxStage,
} from "src/hooks/useContractManager";
import EditUnitComponent from "src/components/ingame/EditUnitComponent";
import PopupComponent from "src/components/ingame/PopupComponent";
import ButtonComponent from "src/components/ingame/ButtonComponent";
import TutorialComponent from "src/components/ingame/TutorialComponent";
import CoverComponent from "src/components/ingame/CoverComponent";
import { convertUnitIdsToNumber, parseEtherToBigint } from "src/utils/Utils";
import { readStorage } from "src/utils/debugStorage";
import { TUTORIAL } from "src/constants/interface";

const initPlayerIds = [1, 2, 3];

type DragAndDrop = {
  index: number;
  isSub: boolean;
};

interface Props {
  tutorial: TUTORIAL;
  clearTutorial: () => void;
  leftStamina: number;
  recoverStamina: () => void;
  stage: number;
}

const EditScenes = ({
  tutorial,
  clearTutorial,
  leftStamina,
  recoverStamina,
  stage,
}: Props) => {
  /**============================
 * useState
 ============================*/
  //Show stage
  const [isCoverVisible, setCoverVisible] = useState(true);
  //Units
  const [playerUnitIds, setPlayerUnitIds] = useState<number[]>([]);
  const [subUnitIds, setSubUnitIds] = useState<number[]>([]);

  //battleId
  const [latestBattleId, setLatestBattleId] = useState<BigInt>(BigInt(0));
  const [isSentTransaction, setSentTransaction] = useState(false);

  //Set dragged and dropped unit for replacing
  const [draggedIndex, setDraggedIndex] = useState<DragAndDrop | null>(null);
  const [droppedIndex, setDroppedIndex] = useState<DragAndDrop | null>(null);

  //Stamina Popup
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPopupVisibleComplete, setPopupVisibleComplete] = useState(false);

  /**============================
 * useWriteContract
 ============================*/
  const { write: writeStart, isLoading: isLoadingStart } = useWriteStartBattle(
    () => {},
    () => {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
        const _battleId = readStorage("battleId");
        // Redirect to battle scene with battleId by router query in index.tsx
        const battleId = _battleId!.toString();
        const currentUrl = window.location.href;
        window.location.href = `${currentUrl}?battle_id=${battleId}`;
      }
    },
    playerUnitIds,
    subUnitIds
  );

  const { write: writeStamina } = useWriteRecoverStamina(
    () => {
      setPopupVisible(false);
      setPopupVisibleComplete(true);
      recoverStamina();
    },
    () => {},
    parseEtherToBigint("0.01") //value
  );

  /**============================
* useWatchEvent
============================*/
  // useWatchBattleIdIncremented();

  /**============================
 * useReadContract
 ============================*/
  const dataPlayerUnits = useReadPlayerUnits();
  const dataSubUnits = useReadSubUnits();
  const dataLatestBattleId = useReadWatchLatestBattleIds();
  const dataMaxStage = useReadMaxStage();

  /**============================
 * useEffect
 ============================*/
  //Initialize player and sub units from contract
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
    console.log("dataSubUnits", dataSubUnits);
    if (dataSubUnits) {
      const _subUnitIds = convertUnitIdsToNumber(dataSubUnits as BigInt[]);
      setSubUnitIds(_subUnitIds);
    }
  }, [dataSubUnits]);

  //Initialize and refetch latestBattleId
  useEffect(() => {
    if (dataLatestBattleId) {
      // After start tx, if the latestBattleId is different from the latestBattleId, redirect to the battle scene
      if (isSentTransaction && dataLatestBattleId !== latestBattleId) {
        const currentUrl = window.location.href;
        window.location.href = `${currentUrl}?battle_id=${Number(dataLatestBattleId)}`;
      } else if (latestBattleId === BigInt(0)) {
        //Initialize latestBattleId, but if latestBattleId is 0, cannot getting by onchain
        setLatestBattleId(dataLatestBattleId);
        console.log("initialize latestBattleId", dataLatestBattleId);
      }
    }
  }, [dataLatestBattleId, latestBattleId, isSentTransaction]);

  //Replace unit position if dragged and dropped
  useEffect(() => {
    if (draggedIndex === null || droppedIndex === null) return;
    if (draggedIndex === droppedIndex) return;

    // console.log("replaceUnits", draggedIndex, droppedIndex);
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

  /**============================
 * Functions
 ============================*/
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
      {isPopupVisible && (
        <PopupComponent
          title={"Stamina Recovery"}
          description={
            "You are running low on stamina. To restore, a donation of 0.01 ETH is required."
          }
          clickOk={writeStamina}
          isCancel={true}
          clickCancel={() => setPopupVisible(false)}
        />
      )}
      {isPopupVisibleComplete && (
        <PopupComponent
          title={"Thank you for your donation!"}
          description={""}
          clickOk={() => {
            console.log("popupVisibleComplete");
            setPopupVisibleComplete(false);
          }}
          isCancel={false}
          clickCancel={() => {}}
        />
      )}

      <TutorialComponent
        isTutorial={!isCoverVisible}
        tutorial={tutorial}
        onComplete={() => {
          clearTutorial();
        }}
      />
      <CoverComponent
        isCoverVisible={isCoverVisible}
        onClick={() => setCoverVisible(false)}
        text={
          stage === Number(dataMaxStage) ? "Final Stage" : `Stage ${stage + 1}`
        }
      />
      <div className="flex flex-col items-center">
        <main className="flex flex-col" style={{ width: "1080px" }}>
          <section className="mt-24 mx-auto">
            <div className="flex justify-center text-lg font-bold">
              Starting units
            </div>
            <div
              className="flex flex-row-reverse mt-4"
              style={{ width: "640px", height: "144px" }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="mx-2 bg-darkgray rounded-md" key={index}>
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
          </section>
          <section className="mt-16 mx-auto">
            <div className="flex justify-center text-lg font-bold">
              Reserve units
            </div>
            <div
              className="flex flex-row-reverse mt-4 justify-center bg-darkgray rounded-md"
              style={{ width: "628px", height: "144px" }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="mx-2" key={index}>
                  <EditUnitComponent
                    index={index}
                    unitId={subUnitIds[index]}
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
          </section>
          <section className="mt-16">
            <div className="text-center">
              <ButtonComponent
                write={() => {
                  if (leftStamina < 1) {
                    setPopupVisible(true);
                    return;
                  }
                  if (isLoadingStart) return;
                  setSentTransaction(true);
                  writeStart();
                }}
                isLoading={isLoadingStart} //once transaction is sent, isLoading is true
                text={"START"}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default EditScenes;

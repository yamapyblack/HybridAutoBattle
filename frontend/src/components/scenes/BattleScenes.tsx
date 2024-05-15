import { useState, useContext, useEffect } from "react";
import Image from "next/image";
import { Scene } from "../../pages/index";
import BattleUnitComponent from "../../components/ingame/BattleUnitComponent";
import {
  Result,
  SKILL_TIMING,
  SKILL_EFFECT,
  SKILL_TARGET,
} from "../../lib/interfaces/interface";
import { SKILLS } from "../../constants/skills";
import { PlasmaBattleAlphaAbi } from "src/constants/plasmaBattleAlphaAbi";
import addresses from "src/constants/addresses";
import { useReadContract, useAccount } from "wagmi";
import { units } from "src/lib/data/cards";
import { type Unit, type UnitVariable } from "src/lib/interfaces/interface";
import { enemyUnitsByStage } from "src/lib/data/init";

enum PHASE {
  BEFORE_BATTLE,
  BEFORE_ATTACK,
  ATTACKING,
}

const BattleScenes = ({ setScene, setResult, setTxHash }) => {
  /**============================
 * useState, useContext
 ============================*/
  const { address } = useAccount();

  const [stage, setStage] = useState(-1);
  const [phase, setPhase] = useState(PHASE.BEFORE_ATTACK);
  const [isCoverVisible, setCoverVisible] = useState(false); // New state variable
  const [isPlayerDead, setIsPlayerDead] = useState(false);
  const [isEnemyDead, setIsEnemyDead] = useState(false);
  const [playerUnits, setPlayerUnits] = useState<Unit[]>([]);
  const [playerUnitsVariable, setPlayerUnitsVariable] = useState<
    UnitVariable[]
  >([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [enemyUnitsVariable, setEnemyUnitsVariable] = useState<UnitVariable[]>(
    []
  );

  /**============================
 * useReadContract
 ============================*/
  const playerStage = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    functionName: "playerStage",
    args: [address as `0x${string}`],
  });

  const dataPlayerUnits = useReadContract({
    abi: PlasmaBattleAlphaAbi,
    address: addresses.PlasmaBattleAlpha as `0x${string}`,
    functionName: "getPlayerUnits",
    args: [address as `0x${string}`],
  });

  /**============================
 * useEffect
 ============================*/
  //Set stage by contract data
  useEffect(() => {
    if (playerStage.data !== undefined) {
      console.log("playerStage.data", playerStage.data);
      setStage(Number(playerStage.data));
    }
  }, [playerStage.data]);

  //Set player units by contract data
  useEffect(() => {
    if (dataPlayerUnits.data) {
      console.log("playerUnitIds.data", dataPlayerUnits.data);
      const _playerUnits: Unit[] = [];
      for (const id of dataPlayerUnits.data as []) {
        if (Number(id) === 0) continue;
        _playerUnits.push(units[Number(id)]);
      }
      console.log("_playerUnits", _playerUnits);
      setPlayerUnits(_playerUnits);

      const _playerUnitsVariable: UnitVariable[] = _playerUnits.map(
        (unit: Unit) => {
          return {
            life: unit.life,
            attack: unit.attack,
            isAnimateAttacking: false,
            isAnimateChangeAttack: false,
            isAnimateChangeLife: false,
          };
        }
      );
      console.log("_playerUnitsVariable", _playerUnitsVariable);
      setPlayerUnitsVariable(_playerUnitsVariable);
    }
  }, [dataPlayerUnits.data]);

  //Set enemy units by stage
  useEffect(() => {
    if (stage >= 0) {
      console.log("stage", stage);
      setEnemyUnits(enemyUnitsByStage[stage].map((id) => units[id]));
      setEnemyUnitsVariable(
        enemyUnitsByStage[stage]
          .map((id) => units[id])
          .map((unit: Unit) => {
            return {
              life: unit.life,
              attack: unit.attack,
              isAnimateAttacking: false,
              isAnimateChangeAttack: false,
              isAnimateChangeLife: false,
            };
          })
      );
    }
  }, [stage]);

  //Judge if player or enemu is dead
  useEffect(() => {
    const judge = async (): Promise<number> => {
      console.log("judge");
      console.log("isPlayerDead", isPlayerDead);
      //If no member, game over
      if (isPlayerDead || isEnemyDead) {
        if (isPlayerDead && isEnemyDead) {
          setResult(Result.DRAW);
        } else if (isPlayerDead) {
          setResult(Result.LOSE);
        } else if (isEnemyDead) {
          setResult(Result.WIN);
        }
        return setScene(Scene.Over);
      } else {
        return Result.NOT_YET;
      }
    };
    judge();
  }, [
    isPlayerDead,
    isEnemyDead,
    playerUnitsVariable,
    enemyUnitsVariable,
    setResult,
    setScene,
  ]);

  /**============================
 * Logic
 ============================*/
  const damageLife = async (
    isToPlayer: boolean,
    index: number,
    value: number
  ) => {
    const _unitVariable = isToPlayer
      ? playerUnitsVariable[index]
      : enemyUnitsVariable[index];
    _unitVariable.life -= value;
    if (_unitVariable.life < 0) _unitVariable.life = 0;
    _unitVariable.isAnimateChangeLife = true;
    console.log("damageLife end");
  };

  const judgeUnitKilled = async (isPlayer: boolean, index: number) => {
    const unitsVariable = isPlayer ? playerUnitsVariable : enemyUnitsVariable;
    const setDead = isPlayer ? setIsPlayerDead : setIsEnemyDead;
    //Judge if life is 0
    if (unitsVariable[index].life === 0) {
      if (unitsVariable.length === 1) {
        console.log(isPlayer ? "setIsPlayerDead" : "setIsEnemyDead");
        setDead(true);
      }
      //Remove dead unit from playerUnits and playerUnitsVariable or enemyUnits and enemyUnitsVariable and set again
      if (isPlayer) {
        setPlayerUnits(playerUnits.filter((_, i) => i !== index));
        setPlayerUnitsVariable(
          playerUnitsVariable.filter((_, i) => i !== index)
        );
      } else {
        setEnemyUnits(enemyUnits.filter((_, i) => i !== index));
        setEnemyUnitsVariable(enemyUnitsVariable.filter((_, i) => i !== index));
      }
    }
  };

  const resetIsAnimation = () => {
    playerUnitsVariable.forEach((unitVariable) => {
      unitVariable.isAnimateChangeLife = false;
      unitVariable.isAnimateChangeAttack = false;
      unitVariable.isAnimateAttacking = false;
    });
    enemyUnitsVariable.forEach((unitVariable) => {
      unitVariable.isAnimateChangeLife = false;
      unitVariable.isAnimateChangeAttack = false;
      unitVariable.isAnimateAttacking = false;
    });
  };

  /**============================
 * Functions(Flow)
 ============================*/
  const startOfBattle = async () => {
    setCoverVisible(false);
    setPhase(PHASE.BEFORE_ATTACK);
    //TODO revive
    // //Execute skill from behind member
    // for (let i = playerUnits.length - 1; i >= 0; i--) {
    //   await _executeSkill(SKILL_TIMING.StartOfBattle, true, i);
    // }
    // for (let i = enemyUnits.length - 1; i >= 0; i--) {
    //   await _executeSkill(SKILL_TIMING.StartOfBattle, false, i);
    // }
  };

  const goNextAction = async () => {
    if (phase === PHASE.BEFORE_ATTACK) {
      //beforeAttack
      setPhase(PHASE.ATTACKING);
      //TODO revive
      // await _executeSkill(SKILL_TIMING.BeforeAttack, true, 0);
      // await _executeSkill(SKILL_TIMING.BeforeAttack, false, 0);

      //attacking
      const _player = playerUnits[0];
      const _enemy = enemyUnits[0];
      playerUnitsVariable[0].isAnimateAttacking = true;
      enemyUnitsVariable[0].isAnimateAttacking = true;
      await Promise.all([
        damageLife(true, 0, _enemy.attack),
        damageLife(false, 0, _player.attack),
      ]);
      console.log("all damageLife end");
      //sleep
      await new Promise((resolve) => setTimeout(resolve, 500));

      //Judge if life is 0
      //Because of animation simultaneously, use Promise.all
      await Promise.all([judgeUnitKilled(true, 0), judgeUnitKilled(false, 0)]);

      //Back to beforeAttack
      setPhase(PHASE.BEFORE_ATTACK);
    }
  };

  /**============================
 * Rendering
 ============================*/
  const UnitSection = ({
    units,
    unitsVariable,
    isPlayer,
    resetIsAnimation,
  }) => (
    <section className="" style={{ width: "440px" }}>
      <div
        className="p-2 flex"
        style={{ height: 132, flexDirection: isPlayer ? "row-reverse" : "row" }}
      >
        {units.map((unit, index) => (
          <div className="my-4 mx-2" key={index}>
            <BattleUnitComponent
              isPlayer={isPlayer}
              index={index}
              unit={unit}
              unitVariable={unitsVariable[index]}
              resetIsAnimation={resetIsAnimation}
            />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <div className="flex flex-col items-center m-auto">
        {isCoverVisible && (
          <>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
              style={{ zIndex: 999 }}
            >
              <div className="text-center"></div>
            </div>
          </>
        )}
        <header className="p-2 w-3/4">
          <div className="flex justify-between items-center w-20 rounded-md bg-darkgray mt-4 pl-2 pr-2">
            <Image src="/images/edit/stage.png" alt="" width={16} height={16} />
            <div className="text-lg font-bold">{stage}</div>
          </div>
        </header>
        <main style={{ width: "920px", margin: "auto" }}>
          <div className="flex flex-col">
            <div className="mt-96 mx-auto flex justify-center">
              <UnitSection
                units={playerUnits}
                unitsVariable={playerUnitsVariable}
                isPlayer={true}
                resetIsAnimation={resetIsAnimation}
              />
              <UnitSection
                units={enemyUnits}
                unitsVariable={enemyUnitsVariable}
                isPlayer={false}
                resetIsAnimation={resetIsAnimation}
              />
            </div>
            <section className="mt-8 mb-8">
              <div className="text-center">
                <button
                  className="bg-sub font-bold pl-14 pr-12 py-1 rounded-md text-decoration-none"
                  onClick={() => {
                    goNextAction();
                  }}
                >
                  <Image
                    src="/images/common/resume.png"
                    alt=""
                    width={24}
                    height={16}
                  />
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default BattleScenes;

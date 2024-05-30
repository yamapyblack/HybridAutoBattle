import { useState, useEffect } from "react";
import Image from "next/image";
import { Scene } from "../../pages/index";
import BattleUnitComponent from "../../components/ingame/BattleUnitComponent";
import HeaderComponent from "../../components/ingame/HeaderComponent";
import {
  Result,
  Skill,
  SKILL_TIMING,
  SKILL_EFFECT,
  SKILL_TARGET,
} from "src/lib/interfaces/interface";
import { SKILLS } from "src/lib/data/skills";
import { units } from "src/lib/data/units";
import { type Unit, type UnitVariable } from "src/lib/interfaces/interface";
import { enemyUnitsByStage } from "src/lib/data/init";
import { useReadPlayerUnits } from "src/lib/hooks/useContractManager";

enum PHASE {
  BEFORE_BATTLE,
  BEFORE_ATTACK,
  ATTACKING,
}

const damageLife = (unitVals: UnitVariable[], index: number, value: number) => {
  const _unitVariable = unitVals[index];
  _unitVariable.life -= value;
  if (_unitVariable.life < 0) _unitVariable.life = 0;
  _unitVariable.isAnimateChangeLife = true;
  console.log("damageLife end");
};

const buffLife = (unitVals: UnitVariable[], index: number, value: number) => {
  const _unitVariable = unitVals[index];
  _unitVariable.life += value;
  _unitVariable.isAnimateChangeLife = true;
  console.log("buffLife end");
};

const buffAttack = (unitVals: UnitVariable[], index: number, value: number) => {
  const _unitVariable = unitVals[index];
  _unitVariable.attack += value;
  _unitVariable.isAnimateChangeAttack = true;
  console.log("buffAttack end");
};

const _executeSkill = async (
  _playerVals: UnitVariable[],
  _enemyVals: UnitVariable[],
  _fromUnitIdx: number,
  _isFromPlayer: boolean,
  _skill: Skill
): Promise<void> => {
  console.log("executeSkill");

  const [_isToPlayer, _unitIndexes, _values] = _getSkillTarget(
    _playerVals,
    _enemyVals,
    _fromUnitIdx,
    _isFromPlayer,
    _skill.target,
    _skill.value
  );
  console.log(_unitIndexes, _values);

  await _emitSkill(
    _playerVals,
    _enemyVals,
    _isToPlayer,
    _unitIndexes,
    _values,
    _skill.effect
  );
};

const _getSkillTarget = (
  _playerVals: UnitVariable[],
  _enemyVals: UnitVariable[],
  _fromUnitIdx: number,
  _isFromPlayer: boolean,
  _skillTarget: SKILL_TARGET,
  _skillValue: number
): [boolean, number[], number[]] => {
  let _isToPlayer: boolean = false;
  let _unitIndexes: number[] = [];
  let _values: number[] = [];

  switch (_skillTarget) {
    case SKILL_TARGET.InFrontOf:
      console.log("InFrontOf");
      if (_isFromPlayer) {
        _isToPlayer = true;
        if (_fromUnitIdx > 0) {
          _unitIndexes = [_fromUnitIdx - 1];
          _values = [_skillValue];
        } else {
          _unitIndexes = [];
          _values = [];
        }
      } else {
        _isToPlayer = false;
        if (_fromUnitIdx > 0) {
          _unitIndexes = [_fromUnitIdx - 1];
          _values = [_skillValue];
        } else {
          _unitIndexes = [];
          _values = [];
        }
      }
      break;

    case SKILL_TARGET.Behind:
      console.log("Behind");
      if (_isFromPlayer) {
        _isToPlayer = true;
        _unitIndexes =
          _fromUnitIdx < _playerVals.length - 1 ? [_fromUnitIdx + 1] : [];
      } else {
        _isToPlayer = false;
        _unitIndexes =
          _fromUnitIdx < _enemyVals.length - 1 ? [_fromUnitIdx + 1] : [];
      }
      _values = [_skillValue];
      break;

    default:
      //TODO error handling
      console.error("Invalid skill target");
  }
  return [_isToPlayer, _unitIndexes, _values];
};

const _emitSkill = async (
  _playerVals: UnitVariable[],
  _enemyVals: UnitVariable[],
  isToPlayer: boolean,
  unitIndexes: number[],
  values: number[],
  skillEffect: SKILL_EFFECT
): Promise<void> => {
  if (unitIndexes.length !== values.length) {
    console.error("emitSkillEffect: Index and value length are not same");
    return;
  }

  for (let i = 0; i < unitIndexes.length; i++) {
    const _unitVals = isToPlayer ? _playerVals : _enemyVals;
    switch (skillEffect) {
      case SKILL_EFFECT.BuffAttack:
        await buffAttack(_unitVals, unitIndexes[i], values[i]);
        break;
      case SKILL_EFFECT.BuffHealth:
        await buffLife(_unitVals, unitIndexes[i], values[i]);
        break;
      case SKILL_EFFECT.Damage:
        await damageLife(_unitVals, unitIndexes[i], values[i]);
        break;
      case SKILL_EFFECT.DebuffAttack:
        // await _unit.debuffAttack(values[i]);
        break;
      default:
        console.error("Invalid skill effect");
    }
  }
};

const BattleScenes = ({ setScene, setResult }) => {
  /**============================
 * useState
 ============================*/
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState(PHASE.BEFORE_BATTLE);
  const [isCoverVisible, setCoverVisible] = useState(true); // New state variable
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
  const dataPlayerUnits = useReadPlayerUnits();

  /**============================
 * useEffect
 ============================*/
  //Set player units by contract data
  useEffect(() => {
    if (dataPlayerUnits) {
      const _playerUnits: Unit[] = [];
      for (const id of dataPlayerUnits as []) {
        if (Number(id) === 0) continue;
        _playerUnits.push(units[Number(id)]);
      }
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
      setPlayerUnitsVariable(_playerUnitsVariable);
    }
  }, [dataPlayerUnits]);

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

  //Judge if player or enemy is dead
  useEffect(() => {
    const judge = async (): Promise<void> => {
      if (phase === PHASE.BEFORE_BATTLE) return;
      if (playerUnitsVariable.length === 0 || enemyUnitsVariable.length === 0) {
        if (
          playerUnitsVariable.length === 0 &&
          enemyUnitsVariable.length === 0
        ) {
          setResult(Result.DRAW);
        } else if (playerUnitsVariable.length === 0) {
          setResult(Result.LOSE);
        } else if (enemyUnitsVariable.length === 0) {
          setResult(Result.WIN);
        }
        setScene(Scene.Over);
      }
    };
    judge();
  }, [playerUnitsVariable, enemyUnitsVariable, setResult, setScene, phase]);

  /**============================
 * Logic
 ============================*/
  const judgeUnitKilled = (isPlayer: boolean, index: number) => {
    const unitsVariable = isPlayer ? playerUnitsVariable : enemyUnitsVariable;
    //Judge if life is 0
    if (unitsVariable[index].life === 0) {
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

  /**============================
 * Functions(Flow)
 ============================*/
  /**
   * Start of battle
   * Execute skill order: PlayerUnit[0] -> EnemyUnit[0] -> PlayerUnit[1] -> EnemyUnit[1] -> ...
   */
  const startOfBattle = async () => {
    setCoverVisible(false);

    for (let i = 0; i < 5; i++) {
      if (playerUnits[i]) {
        for (let j = 0; j < playerUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[playerUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", i, true);
            playerUnitsVariable[i].isAnimateAttacking = true;
            setPlayerUnitsVariable([...playerUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));

            await _executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              i,
              true,
              _skill
            );
            setPlayerUnitsVariable([...playerUnitsVariable]); //reflesh
            setEnemyUnitsVariable([...enemyUnitsVariable]);
          }
        }
      }
      if (enemyUnits[i]) {
        for (let j = 0; j < enemyUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[enemyUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", i, false);
            enemyUnitsVariable[i].isAnimateAttacking = true;
            setEnemyUnitsVariable([...enemyUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));

            await _executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              i,
              false,
              _skill
            );
            setPlayerUnitsVariable([...playerUnitsVariable]); //reflesh
            setEnemyUnitsVariable([...enemyUnitsVariable]);
          }
        }
      }
    }
    setPhase(PHASE.BEFORE_ATTACK);
  };

  const goNextAction = async () => {
    if (phase === PHASE.BEFORE_ATTACK) {
      //beforeAttack
      setPhase(PHASE.ATTACKING);
      //TODO revive
      // await _executeSkill(SKILL_TIMING.BeforeAttack, true, 0);
      // await _executeSkill(SKILL_TIMING.BeforeAttack, false, 0);

      //attacking
      console.log("attacking");
      playerUnitsVariable[0].isAnimateAttacking = true;
      enemyUnitsVariable[0].isAnimateAttacking = true;
      setPlayerUnitsVariable([...playerUnitsVariable]);
      setEnemyUnitsVariable([...enemyUnitsVariable]);
      await new Promise((resolve) => setTimeout(resolve, 500));

      //damage
      console.log("damage");
      damageLife(playerUnitsVariable, 0, enemyUnitsVariable[0].attack);
      damageLife(enemyUnitsVariable, 0, playerUnitsVariable[0].attack);
      setPlayerUnitsVariable([...playerUnitsVariable]); //refresh
      setEnemyUnitsVariable([...enemyUnitsVariable]); //refresh

      // sleep;
      await new Promise((resolve) => setTimeout(resolve, 300));

      //Judge if life is 0
      judgeUnitKilled(true, 0);
      judgeUnitKilled(false, 0);

      //Back to beforeAttack
      setPhase(PHASE.BEFORE_ATTACK);
    }
  };

  /**============================
 * Rendering
 ============================*/
  const UnitSection = ({ units, unitsVariable, isPlayer }) => (
    <section className="" style={{ width: "520px" }}>
      <div
        className="p-2 flex"
        style={{ height: 132, flexDirection: isPlayer ? "row-reverse" : "row" }}
      >
        {units.map((unit, index) => (
          <div className="my-4 mx-2" key={index}>
            <BattleUnitComponent
              index={index}
              unit={unit}
              unitVariable={unitsVariable[index]}
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
              onClick={startOfBattle}
            >
              <div className="text-center text-8xl">START</div>
            </div>
          </>
        )}
        <HeaderComponent onStageChange={setStage} />
        <main style={{ width: "1080px", margin: "auto" }}>
          <div className="flex flex-col">
            <div className="mt-96 mx-auto flex justify-center">
              <UnitSection
                units={playerUnits}
                unitsVariable={playerUnitsVariable}
                isPlayer={true}
              />
              <UnitSection
                units={enemyUnits}
                unitsVariable={enemyUnitsVariable}
                isPlayer={false}
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

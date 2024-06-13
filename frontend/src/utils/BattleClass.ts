import {
  type UnitVariable,
  Skill,
  SKILL_EFFECT,
  SKILL_TARGET,
} from "src/constants/interface";
import { abiEncodePacked } from "src/utils/Utils";

export type RandomSeed = {
  prevBlockNumber: BigInt;
  timestamp: BigInt;
  txOrigin: `0x${string}`;
};

export default class BattleClass {
  readonly battleId: number;
  readonly randomSeed: RandomSeed;
  private _randomIndex = 0;

  constructor(battleId: number, randomSeed: RandomSeed) {
    this.battleId = battleId;
    this.randomSeed = randomSeed;
  }

  getRnadomNumber = (_num: number): number => {
    // return uint256(keccak256(abi.encodePacked(_battleId, randomSeed.prevBlockNumber, randomSeed.timestamp, randomSeed.txOrigin, _index)));
    const prevBlockNumber = this.randomSeed[0];
    const timestamp = this.randomSeed[1];
    const txOrigin = this.randomSeed[2];
    const _encoded = abiEncodePacked(
      ["uint256", "uint256", "uint256", "address", "uint8"],
      [this.battleId, prevBlockNumber, timestamp, txOrigin, this._randomIndex]
    );
    console.log("encoded", _encoded);
    const _randomNum = Number(_encoded) % _num;
    console.log("randomNum", _randomNum);
    this._randomIndex++;
    return _randomNum;
  };

  damageLife = (unitVals: UnitVariable[], index: number, value: number) => {
    const _unitVariable = unitVals[index];
    if (_unitVariable.life < value) value = _unitVariable.life;
    _unitVariable.life -= value;
    console.log("damageLife end");
  };

  debuffLife = (unitVals: UnitVariable[], index: number, value: number) => {
    const _unitVariable = unitVals[index];
    if (_unitVariable.life < value) value = _unitVariable.life;
    _unitVariable.life -= value;
    _unitVariable.isAnimateDebuffLife = value;
    console.log("debuffLife end");
  };

  debuffAttack = (unitVals: UnitVariable[], index: number, value: number) => {
    const _unitVariable = unitVals[index];
    if (_unitVariable.attack < value) value = _unitVariable.attack;
    _unitVariable.attack -= value;
    _unitVariable.isAnimateDebuffAttack = value;
    console.log("debuffAttack end");
  };

  buffLife = async (unitVals: UnitVariable[], index: number, value: number) => {
    const _unitVariable = unitVals[index];
    _unitVariable.life += value;
    _unitVariable.isAnimateBuffLife = value;
    console.log("buffLife end");
  };

  buffAttack = (unitVals: UnitVariable[], index: number, value: number) => {
    const _unitVariable = unitVals[index];
    _unitVariable.attack += value;
    _unitVariable.isAnimateBuffAttack = value;
    console.log("buffAttack end");
  };

  executeSkill = async (
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _fromUnitIdx: number,
    _isFromPlayer: boolean,
    _skill: Skill
  ): Promise<void> => {
    console.log("executeSkill");

    const [_isToPlayer, _unitIndexes] = this._getSkillTarget(
      _playerVals,
      _enemyVals,
      _fromUnitIdx,
      _isFromPlayer,
      _skill.target
    );
    //_values length is same as _unitIndexes length
    const _values = _unitIndexes.map(() => _skill.value);
    console.log(_unitIndexes, _values);

    await this._emitSkill(
      _playerVals,
      _enemyVals,
      _isToPlayer,
      _unitIndexes,
      _values,
      _skill.effect
    );
  };

  private _getSkillTarget = (
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _fromUnitIdx: number,
    _isFromPlayer: boolean,
    _skillTarget: SKILL_TARGET
  ): [boolean, number[]] => {
    let _isToPlayer: boolean = false;
    let _unitIndexes: number[] = [];

    switch (_skillTarget) {
      case SKILL_TARGET.RandomPlayer:
        if (_isFromPlayer) {
          _isToPlayer = true;
          _unitIndexes = [this.getRnadomNumber(_playerVals.length)];
        } else {
          _isToPlayer = false;
          _unitIndexes = [this.getRnadomNumber(_enemyVals.length)];
        }
        break;

      case SKILL_TARGET.RandomEnemy:
        if (_isFromPlayer) {
          _isToPlayer = false;
          _unitIndexes = [this.getRnadomNumber(_enemyVals.length)];
        } else {
          _isToPlayer = true;
          _unitIndexes = [this.getRnadomNumber(_playerVals.length)];
        }
        break;

      case SKILL_TARGET.InFrontOf:
        console.log("InFrontOf");
        if (_isFromPlayer) {
          _isToPlayer = true;
          if (_fromUnitIdx > 0) {
            _unitIndexes = [_fromUnitIdx - 1];
          } else {
            _unitIndexes = [];
          }
        } else {
          _isToPlayer = false;
          if (_fromUnitIdx > 0) {
            _unitIndexes = [_fromUnitIdx - 1];
          } else {
            _unitIndexes = [];
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
        break;

      default:
        //TODO error handling
        console.error("Invalid skill target");
    }
    return [_isToPlayer, _unitIndexes];
  };

  private _emitSkill = async (
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
          await this.buffAttack(_unitVals, unitIndexes[i], values[i]);
          break;
        case SKILL_EFFECT.BuffHealth:
          await this.buffLife(_unitVals, unitIndexes[i], values[i]);
          break;
        case SKILL_EFFECT.Damage:
          await this.damageLife(_unitVals, unitIndexes[i], values[i]);
          break;
        case SKILL_EFFECT.DebuffAttack:
          await this.debuffAttack(_unitVals, unitIndexes[i], values[i]);
          break;
        default:
          console.error("Invalid skill effect");
      }
    }
  };
}

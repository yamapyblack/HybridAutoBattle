export enum SKILL_TIMING {
  StartOfBattle,
  BeforeAttack,
  KnockOut,
}
export enum SKILL_EFFECT {
  BuffAttack,
  BuffHealth,
  Damage,
  DebuffAttack,
}
export enum SKILL_TARGET {
  RandomPlayer,
  Random2Players,
  RandomEnemy,
  Random2Enemies,
  InFrontOf,
  Behind,
}

export enum Result {
  NOT_YET,
  WIN,
  LOSE,
  DRAW,
}

export type Unit = {
  id: number;
  name: string;
  imagePath: string;
  life: number;
  attack: number;
  description: string;
  skillIds: number[];
};

export type UnitVariable = {
  life: number;
  attack: number;
  isAnimateChangeLife: boolean;
  isAnimateChangeAttack: boolean;
  isAnimateAttacking: boolean;
};

export interface Skill {
  id: number;
  name: string;
  description: string;
  timing: SKILL_TIMING;
  effect: SKILL_EFFECT;
  target: SKILL_TARGET;
  value: number;
}

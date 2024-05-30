export const initPlayerIds = [1, 2, 3];

export const enemyUnitsByStage: {
  [key: number]: number[];
} = {
  0: [8001, 8002, 8003],
  1: [8002, 8002, 8003, 8003],
  2: [8004, 8005, 8004],
};

export const newUnitByStage: {
  [key: number]: number;
} = {
  1: 4,
  2: 5,
};

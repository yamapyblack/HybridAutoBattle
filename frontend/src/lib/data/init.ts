import { type Unit } from "../interfaces/interface";

export const enemyUnitsByStage: {
  [key: number]: number[];
} = {
  0: [88],
  1: [1, 2, 3],
};

export const initMainMembers: Unit[] = [
  {
    id: 4,
    name: "Ant4",
    imagePath: "1004",
    life: 4,
    attack: 3,
    description: "",
    skillIds: [12],
  },
  {
    id: 1,
    name: "Ant1",
    imagePath: "1001",
    life: 5,
    attack: 2,
    description: "",
    skillIds: [],
  },
];

export const initSubMembers: { [key: number]: Unit[] } = {
  2: [
    {
      id: 2,
      name: "Ant2",
      imagePath: "1002",
      life: 3,
      attack: 3,
      description: "",
      skillIds: [],
    },
  ],
  3: [
    {
      id: 3,
      name: "Ant3",
      imagePath: "1003",
      life: 2,
      attack: 4,
      description: "",
      skillIds: [],
    },
  ],
  4: [
    {
      id: 4,
      name: "Ant4",
      imagePath: "1004",
      life: 4,
      attack: 3,
      description: "",
      skillIds: [12],
    },
  ],
  5: [
    {
      id: 5,
      name: "Ant5",
      imagePath: "1005",
      life: 9,
      attack: 4,
      description: "",
      skillIds: [],
    },
  ],
};

export const enemyMembersByStage: {
  [key: number]: Unit[];
} = {
  1: [
    {
      id: 1001,
      name: "Alice",
      imagePath: "1001",
      life: 2,
      attack: 2,
      description: "Alice's description",
      skillIds: [],
    },
  ],
  2: [
    {
      id: 1001,
      name: "Alice",
      imagePath: "1001",
      life: 2,
      attack: 2,
      description: "Alice's description",
      skillIds: [],
    },
    {
      id: 1003,
      name: "Charlie",
      imagePath: "1003",
      life: 3,
      attack: 2,
      description: "Charlie's description",
      skillIds: [],
    },
  ],
  3: [
    {
      id: 1001,
      name: "Alice",
      imagePath: "1001",
      life: 2,
      attack: 2,
      description: "Alice's description",
      skillIds: [],
    },
    {
      id: 1002,
      name: "Bob",
      imagePath: "1002",
      life: 4,
      attack: 4,
      description: "Bob's description",
      skillIds: [],
    },
    {
      id: 1003,
      name: "Charlie",
      imagePath: "1003",
      life: 2,
      attack: 2,
      description: "Charlie's description",
      skillIds: [],
    },
  ],
  4: [
    {
      id: 1001,
      name: "Alice",
      imagePath: "1001",
      life: 3,
      attack: 3,
      description: "Alice's description",
      skillIds: [],
    },
    {
      id: 1002,
      name: "Bob",
      imagePath: "1002",
      life: 4,
      attack: 4,
      description: "Bob's description",
      skillIds: [],
    },
    {
      id: 1003,
      name: "Charlie",
      imagePath: "1003",
      life: 4,
      attack: 2,
      description: "Charlie's description",
      skillIds: [],
    },
    {
      id: 1003,
      name: "Charlie",
      imagePath: "1003",
      life: 4,
      attack: 2,
      description: "Charlie's description",
      skillIds: [],
    },
  ],
  5: [
    {
      id: 6,
      name: "Wizard1",
      imagePath: "1001",
      life: 4,
      attack: 2,
      description: "",
      skillIds: [7],
    },
    {
      id: 7,
      name: "Wizard2",
      imagePath: "1002",
      life: 4,
      attack: 7,
      description: "",
      skillIds: [7],
    },
    {
      id: 8,
      name: "Boss",
      imagePath: "1003",
      life: 10,
      attack: 10,
      description: "",
      skillIds: [],
    },
  ],
};

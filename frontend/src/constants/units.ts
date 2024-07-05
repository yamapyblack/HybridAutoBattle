import { type Unit } from "src/constants/interface";
export const units: { [key: number]: Unit } = {
  1001: {
    id: 1001,
    name: "Goblin",
    imagePath: "1001",
    attack: 2,
    life: 2,
    description: "",
    skillIds: [],
  },
  1002: {
    id: 1002,
    name: "Orc",
    imagePath: "1002",
    attack: 3,
    life: 3,
    description: "",
    skillIds: [],
  },
  1003: {
    id: 1003,
    name: "Seraphina the Healer",
    imagePath: "1003",
    attack: 3,
    life: 4,
    description: "Start of battle, give +1 life to in front unit.",
    skillIds: [16],
  },
  1004: {
    id: 1004,
    name: "Mary the Azure Mage",
    imagePath: "1004",
    attack: 3,
    life: 2,
    description: "Start of battle, deal 1 damage to one random enemy.",
    skillIds: [7],
  },
  1005: {
    id: 1005,
    name: "Treant",
    imagePath: "1005",
    attack: 2,
    life: 3,
    description: "Start of battle, give +2 attack to behind unit.",
    skillIds: [17],
  },
  1006: {
    id: 1006,
    name: "Paladin",
    imagePath: "1006",
    attack: 3,
    life: 5,
    description: "",
    skillIds: [],
  },
  1007: {
    id: 1007,
    name: "Balrog",
    imagePath: "1007",
    attack: 3,
    life: 4,
    description: "Start of battle, deal 1 damage to two random enemies.",
    skillIds: [9],
  },
  1008: {
    id: 1008,
    name: "King Gox",
    imagePath: "1008",
    attack: 7,
    life: 7,
    description: "",
    skillIds: [],
  },
  8001: {
    id: 8001,
    name: "Ant1",
    imagePath: "8001",
    attack: 2,
    life: 2,
    description: "",
    skillIds: [],
  },
  8002: {
    id: 8002,
    name: "Ant1",
    imagePath: "8002",
    attack: 3,
    life: 2,
    description: "",
    skillIds: [],
  },
  8003: {
    id: 8003,
    name: "Ant1",
    imagePath: "8003",
    attack: 4,
    life: 3,
    description: "",
    skillIds: [],
  },
  8004: {
    id: 8004,
    name: "Ant1",
    imagePath: "8004",
    attack: 5,
    life: 5,
    description: "",
    skillIds: [],
  },
  8005: {
    id: 8005,
    name: "Ant1",
    imagePath: "8005",
    attack: 5,
    life: 1,
    description: "",
    skillIds: [],
  },
  8006: {
    id: 8006,
    name: "Ant1",
    imagePath: "8006",
    attack: 4,
    life: 4,
    description: "",
    skillIds: [8],
  },
};

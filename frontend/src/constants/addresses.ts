import {
  scrollSepolia,
  zkSyncSepoliaTestnet,
  base,
  baseSepolia,
} from "wagmi/chains";

const _addresses: { [chainId: number]: { [key: string]: string } } = {
  [zkSyncSepoliaTestnet.id]: {
    PlasmaBattleAlpha: "0x0dcB6E9787EDB74B425459B7A2c622fCd4aA177C",
  },
  [scrollSepolia.id]: {
    PlasmaBattleAlpha: "0x03605f52150387d6a33fc2e7f2736ce5f4111eb1",
  },
  [base.id]: {
    PlasmaBattleAlpha: "0x37f6c278888e3A826A7341727D06c062C67dea1A",
  },
  [baseSepolia.id]: {
    PlasmaBattleAlpha: "0xE14E289feC2d103b1e3AF55Fb8C309E8f5747edE",
  },
};

const addresses = (chainId: number) => {
  const addresses_ = _addresses[chainId];
  if (!addresses_) {
    console.error(`addresses not found for chainId: ${chainId}`);
  }
  return addresses_;
};

export default addresses;

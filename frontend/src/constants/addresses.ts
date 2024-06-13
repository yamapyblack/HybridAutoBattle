import {
  scrollSepolia,
  zkSyncSepoliaTestnet,
  base,
  baseSepolia,
} from "wagmi/chains";

const _addresses: { [chainId: number]: { [key: string]: string } } = {
  [zkSyncSepoliaTestnet.id]: {
    PlasmaBattleAlpha: "0xD1a7fa9ea17E71fB458B0a3C74Fa445736ea6cb0",
  },
  [scrollSepolia.id]: {
    PlasmaBattleAlpha: "0xBafC090B1f514792Ab15336c0bc180f230415bF1",
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

export const convertUnitIdsToNumber = (unitIds: BigInt[]): number[] => {
  // If 0n is included in the array, it is removed.
  let unitNumbers: number[] = [];
  for (const id of unitIds as []) {
    if (Number(id) === 0) continue;
    unitNumbers.push(Number(id));
  }
  return unitNumbers;
};

export const convertUnitIdsToBigInt = (unitIds: number[]): BigInt[] => {
  return unitIds.map((id) => BigInt(id));
};

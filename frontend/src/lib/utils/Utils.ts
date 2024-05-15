export const convertUnitIds = (unitIds: BigInt[]): number[] => {
  let unitNumbers: number[] = [];
  for (const id of unitIds as []) {
    if (Number(id) === 0) continue;
    unitNumbers.push(Number(id));
  }
  return unitNumbers;
};

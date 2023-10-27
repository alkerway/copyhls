export const ZipArrays = <T>(arrayOfArrays: T[][]): T[] => {
  const maxLength = Math.max(...arrayOfArrays.map((a) => a.length));
  let flatArr: T[] = [];
  for (let i = 0; i < maxLength; i++) {
    arrayOfArrays.forEach((arr) => {
      arr[i] && flatArr.push(arr[i]);
    });
  }
  return flatArr;
};

const [_1, _2, urlArgument, refererArgument] = process.argv;
const nowDate = new Date();
let stopDate = new Date(
  nowDate.getFullYear(),
  nowDate.getMonth(),
  nowDate.getDate(),
  12,
  30,
  0,
  0
);
const diffInSeconds = (stopDate.getTime() - nowDate.getTime()) / 1000;

export const initialUrl =
  urlArgument ||
  `

`.trim();
export const referer =
  refererArgument ||
  `

`.trim();
export const stopAfter = 60 * 60 * 7.5;
// export const stopAfter = diffInSeconds
if (stopAfter <= 0) {
  console.log("Invalid stop time, cancelling");
  process.exit();
}
export const levelPollIntervalSeconds = 6;
export const storageBase = "manifest";

export const outputFormat = "mp4";

export const maxConcurrentDownloads = 10;
export const maxStallCount = 4;
export const maxNetworkError = 5;

// experimental, needs testing
export const decryptAES128Frags = false;

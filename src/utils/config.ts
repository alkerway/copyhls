<<<<<<< HEAD
export const levelUrl = `
https://b-g-eu-4.betterstream.co:2222/v2-hls-playback/6a1ed4191d44b0f327695156c0e9ff5697f10c49f27c31ccd9ba9a014063cce5e37967092386cca8a6e68f178d9f14fbc86d7d99885201e62bd0d04d6ea09c0f928ae55a0c18875349d44d20b5540162604565560168b5b57b605445b98adcd2cdf9537133ca6e79a034b842be10a77e30fd5bfe20eb8f2ae11f3463c777c18e5b3b8081e958b0d1630fe405a8d9e376965b80a65d1c16221cd7bda3ee6952f0/720/index.m3u8
=======
const [_1, _2, url, ref] = process.argv

export const levelUrl = url || `
>>>>>>> master
`.trim()
export const referer = ref || `
`.trim()
<<<<<<< HEAD
export const stopAfter = 60 * 60 * 1
=======
export const stopAfter = 60 * 60 * 0.01
>>>>>>> master
export const levelPollInterval = 6
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

<<<<<<< HEAD
export const maxConcurrentDownloads = 5
export const maxStallCount = 10
export const maxNetworkError = 4
=======
export const maxConcurrentDownloads = 6
export const maxStallCount = 5
export const maxNetworkError = 3
>>>>>>> master

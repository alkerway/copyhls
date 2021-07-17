const [_1, _2, url, ref] = process.argv

export const levelUrl = url || `
https://e10.cdnfoxtv.me/ingestnb4s/espn_usa/f.m3u8
`.trim()
export const referer = ref || `
https://freefeds.com
`.trim()
export const stopAfter = 60 * 60 * 0.5
export const levelPollInterval = 4
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

export const maxConcurrentDownloads = 5
export const maxStallCount = 10
export const maxNetworkError = 4

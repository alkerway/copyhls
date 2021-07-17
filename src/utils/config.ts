const [_1, _2, url, ref] = process.argv

export const levelUrl = url || `
`.trim()
export const referer = ref || `
`.trim()
export const stopAfter = 60 * 60 * 0.01
export const levelPollInterval = 6
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

export const maxConcurrentDownloads = 6
export const maxStallCount = 5
export const maxNetworkError = 3
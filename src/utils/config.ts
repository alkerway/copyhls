export const levelUrl = `
http://localhost:8880/remote/level.m3u8?url=http://localhost:8008/level.m3u8
`.trim()
export const referer = `

`.trim()
export const stopAfter = 60 * 60 * 0.05
export const tickSeconds = 4
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

export const maxConcurrentDownloads = 6
export const maxStallCount = 10
export const maxNetworkError = 4
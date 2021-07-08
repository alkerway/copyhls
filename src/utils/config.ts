export const levelUrl = `
https://nzp-ms05.si.edu/live_edge_panda/smil:panda02_all.smil/chunklist_w891440426_b2464000.m3u8
`.trim()
export const referer = `
https://nationalzoo.si.edu/webcams/panda-cam
`.trim()
export const stopAfter = 60 * 60 * 0.5
export const tickSeconds = 4
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

export const maxConcurrentDownloads = 6
export const maxStallCount = 10
export const maxNetworkError = 4
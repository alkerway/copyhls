const [_1, _2, url, ref] = process.argv
const nowDate = new Date()
let stopDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 12, 30, 0,0)
const diffInSeconds = (stopDate.getTime() - nowDate.getTime()) / 1000



export const levelUrl = url || `

`.trim()
export const referer = ref || `

`.trim()
export const stopAfter = 60 * 60 * 0.5
// export const stopAfter = diffInSeconds
if (stopAfter <= 0) {
    console.log('Invalid stop time, cancelling')
    process.exit()
}
export const levelPollInterval = 6
export const storageBase = 'manifest'

export const outputFormat = 'mp4'

export const maxConcurrentDownloads = 10
export const maxStallCount = 4
export const maxNetworkError = 1

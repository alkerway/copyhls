import { Frag } from "../types/frag"
import { levelUrl, storageBase } from "../utils/config"

class LevelParse {
    public parseLevel = (levelText: string) => {
        const allFrags = this.extractFrags(levelText)
        return allFrags
    }

    private extractFrags = (manifest: string): Frag[] => {
        const frags: Frag[] = []
        const lines = manifest.split('\n')
        let mediaSequence = 0
        let curFragSequence = 0
        let curTagLines: string[] = []
        let curFragDuration = 0

        for (const line of lines) {
            if (line.startsWith('##') || !line.trim()) {
                // line is comment
            } else if (line.startsWith('#')) {
                curTagLines.push(line)
                if (line.indexOf('EXTINF:') > -1) {
                    const durationRegex = /EXTINF\:(.+),/
                    const match = durationRegex.exec(line)
                    if (match && match[1]) {
                        curFragDuration = Number(match[1])
                    } else {
                        console.log('!! no frag duration extracted from extinf tag ', line)
                    }
                }
                if (line.indexOf('EXT-X-MEDIA-SEQUENCE') > -1) {
                    const mediaSequenceRegex = /EXT-X-MEDIA-SEQUENCE\:(.+)(,|$)/
                    const match = mediaSequenceRegex.exec(line)
                    if (match && match[1]) {
                        mediaSequence = Number(match[1])
                    }
                }
            } else {
                let remoteUrl = ''
                let storagePath = ''
                // console.log(line)
                if (line.startsWith('http')) {
                    storagePath = line.split('?')[0].split('/').slice(-1)[0]
                    remoteUrl = line
                } else if (line.startsWith('/')) {
                    storagePath = line.split('?')[0].split('/').slice(-1)[0]
                    const origin = levelUrl.split('/').slice(0, 3).join('/')
                    remoteUrl = `${origin}${line}`
                } else {
                    storagePath = line.split('?')[0]
                    const trimmedPath = levelUrl.split('?')[0].split('/').slice(0, -1).join('/')
                    remoteUrl = `${trimmedPath}/${line}`
                }
                const newFrag: Frag = {
                    storagePath: `${storageBase}/frags/${storagePath}`,
                    remoteUrl,
                    tagLines: curTagLines, 
                    downloaded: false,
                    idx: curFragSequence + mediaSequence,
                    duration: curFragDuration
                }
                frags.push(newFrag)
                curTagLines = []
                curFragDuration = 0
                curFragSequence++
            }
        }
        return frags
    }
}

export default new LevelParse
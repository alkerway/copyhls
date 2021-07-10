import { Frag, ExtKey } from "../types"
import { levelUrl, storageBase } from "../utils/config"

class LevelParse {
    private firstMediaSequence: null | number = null

    public getFragsFromManifest =  (manifest: string): [Frag[], boolean] => {
        const frags: Frag[] = []
        const lines = manifest.split('\n')
        let mediaSequence = 0
        let curTagLines: string[] = []
        let curFragDuration = 0
        let curFragSequence = 0
        let curExtKey: ExtKey | null = null
        let hasEndlist = false

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
                        if (this.firstMediaSequence === null) {
                            this.firstMediaSequence = mediaSequence
                        }
                    }
                }
                if (line.indexOf('#EXT-X-KEY') > -1) {
                    const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/
                    const dataStr = line.split(/:(.+)/)[1]
                    const dataParts = dataStr.split(commaRegex)
                    const keyData = dataParts.reduce((keyObj, keyval) => {
                        let [attr, val] = keyval.split(/=(.+)/)
                        attr = attr.toLowerCase()
                        if (attr === 'method' ||
                            attr === 'uri' ||
                            attr === 'iv') {
                            keyObj[attr] = val.replace(/['"]+/g, '')
                        }
                        return keyObj
                    }, {} as ExtKey)
                    if (keyData.method?.toLowerCase() === 'none') {
                        curExtKey = null
                    } else if (keyData.method?.toLowerCase() === 'aes-128' && keyData.uri) {
                        keyData['remoteUrl'] = this.getRemoteUrl(keyData.uri, levelUrl)
                        keyData['storagePath'] = `${storageBase}/keys/${keyData.uri.replace(/[\/\\:*?"<>]/g, "")}`
                        keyData['localManifestLine'] = line.replace(keyData.uri, keyData.storagePath.slice(storageBase.length + 1))
                        curExtKey = keyData
                    }
                }
                if (line.indexOf('#EXT-X-ENDLIST' )> -1) {
                    hasEndlist = true
                }
            } else {
                let remoteUrl = this.getRemoteUrl(line, levelUrl)
                const fragIdx = curFragSequence + mediaSequence - (this.firstMediaSequence || 0)
                let storagePath = `frag_${fragIdx}.ts`
                const newFrag: Frag = {
                    key: curExtKey,
                    storagePath: `${storageBase}/frags/${storagePath}`,
                    remoteUrl,
                    tagLines: curTagLines, 
                    downloaded: false,
                    idx: fragIdx,
                    duration: curFragDuration
                }
                frags.push(newFrag)
                curTagLines = []
                curFragDuration = 0
                curFragSequence++
            }
        }
        return [frags, hasEndlist]
    }

    private getRemoteUrl = (line: string, levelUrl: string): string => {
        if (line.startsWith('http')) {
            return line
        } else if (line.startsWith('/')) {
            const origin = levelUrl.split('/').slice(0, 3).join('/')
            return `${origin}${line}`
        } else {
            const trimmedPath = levelUrl.split('?')[0].split('/').slice(0, -1).join('/')
            return `${trimmedPath}/${line}`
        }
    }
}

export default new LevelParse
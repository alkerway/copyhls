import { Frag } from "../types/frag";

import { pathExists, appendFile, writeFile } from 'fs-extra'
import { storageBase } from "../utils/config";


class WriteToManifest {
    private isFirstWrite = true
    private totalDuration = 0


    public write = async (frag: Frag): Promise<Frag> => {
        const levelPath = `${storageBase}/level.m3u8`
        
        if (this.isFirstWrite) {
            this.isFirstWrite = false
            await writeFile(levelPath, '')
        }

        if (frag.key) {
            const originalKeyLine = frag.tagLines.find(line => line.includes('EXT-X-KEY'))
            if (originalKeyLine) {
                const originalIdx = frag.tagLines.indexOf(originalKeyLine)
                frag.tagLines[originalIdx] = frag.key.localManifestLine
            }
        }
        
        const text = `${frag.tagLines.join('\n')}\n${frag.storagePath.split('/').slice(1).join('/')}\n`
        await appendFile(levelPath, text)
        this.totalDuration += frag.duration
        console.log(`Frag ${frag.idx} written to ${frag.storagePath} (${(this.totalDuration / 60).toFixed(1)}min)`)
        return frag
    }
}

export default new WriteToManifest
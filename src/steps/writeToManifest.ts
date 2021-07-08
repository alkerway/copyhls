import { Frag } from "../types/frag";

import { pathExists, appendFile, writeFile } from 'fs-extra'
import { storageBase } from "../utils/config";


class WriteToManifest {
    private isFirstWrite = true


    public write = async (frag: Frag): Promise<Frag> => {
        const levelPath = `${storageBase}/level.m3u8`
        
        if (this.isFirstWrite) {
            this.isFirstWrite = false
            await writeFile(levelPath, '')
        }
        
        const text = `${frag.tagLines.join('\n')}\n${frag.storagePath.split('/').slice(1).join('/')}\n`
        await appendFile(levelPath, text)
        return frag
    }
}

export default new WriteToManifest
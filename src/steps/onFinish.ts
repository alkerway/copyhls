import { pathExists, appendFile } from "fs-extra"
import { exec } from "child_process"
import { promisify } from 'util'

const promiseExec = promisify(exec)

import { storageBase, outputFormat } from "../utils/config"


class Finished {
    public assembleVideo = async () => {
        const levelPath = `${storageBase}/level.m3u8`
        const levelExists = await pathExists(levelPath)
        if (levelExists) {
            await appendFile(levelPath, '#EXT-X-ENDLIST')
            console.log('Compiling video...')
            const stamp = new Date().toLocaleTimeString().slice(0,7)
            await promiseExec(`ffmpeg -y -i ${levelPath} -c copy ${storageBase}/video_${stamp}.${outputFormat}`)
        }
        console.log('Done')
    }
}

export default new Finished
import fetch, { RequestInit } from "node-fetch";
import {createWriteStream, pathExists, mkdirp} from 'fs-extra'
import { pipeline } from 'stream'
import { promisify } from 'util'

import { referer } from "../utils/config" 
import { Frag } from "../types/frag";
import Events from "../utils/events";
import { defer, from, of } from "rxjs";


class DownloadFrag {
    public download = (frag: Frag) => {
        const {remoteUrl, storagePath} = frag
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer
            }
        }
        const basePath = frag.storagePath.split('/').slice(0, -1).join('/')
        return defer(async () => {
                const streamPipeline = promisify(pipeline)
                const exists = await pathExists(basePath)
                if (!exists) {
                    await mkdirp(basePath)
                }
                const res = await fetch(remoteUrl, options)
                if (!res.ok) {
                    throw new Error(`unexpected res ${res.statusText}`)
                }
                await streamPipeline(res.body, createWriteStream(storagePath))
                
                return frag
            })

    }
}

export default new DownloadFrag
import fetch, { RequestInit } from "node-fetch";
import AbortController from "abort-controller"
import {createWriteStream, pathExists, mkdirp} from 'fs-extra'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { defer } from "rxjs"
import { referer } from "./config";


export const RemoteToFile = (remoteUrl: string, storagePath: string, requestTimeout=20) => {
    return defer(async () => {
        const basePath = storagePath.split('/').slice(0, -1).join('/')
        const exists = await pathExists(basePath)
        if (!exists) {
            await mkdirp(basePath)
        }
        const streamPipeline = promisify(pipeline)
        
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, requestTimeout * 1000);
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer,
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
            },
            compress: false,
            signal: controller.signal
        }
        try {
            const res = await fetch(remoteUrl, options)
            if (!res.ok) {
                const errorText = `${res.status} ${res.statusText}`
                throw new Error(errorText)
            }
            await streamPipeline(res.body, createWriteStream(storagePath))
            clearTimeout(timeout)
        } catch(error) {
            clearTimeout(timeout)
            throw error
        }
    })
}
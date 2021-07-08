import fetch, { RequestInit } from "node-fetch";
import {createWriteStream, pathExists, mkdirp} from 'fs-extra'
import { pipeline } from 'stream'
import { promisify } from 'util'

import { referer } from "../utils/config" 
import { Frag } from "../types/frag";
import { mergeMap, defer, Observable, retryWhen, timer, throwError, catchError, EMPTY, of } from "rxjs";


class DownloadFrag {
    private maxRetry = 3

    public download = (frag: Frag): Observable<Frag> => {
        const {remoteUrl, storagePath} = frag
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer
            }
        }
        const basePath = frag.storagePath.split('/').slice(0, -1).join('/')
        console.log(`Starting download ${frag.idx}`)
        return defer(async () => {
                const streamPipeline = promisify(pipeline)
                const exists = await pathExists(basePath)
                if (!exists) {
                    await mkdirp(basePath)
                }
                const res = await fetch(remoteUrl, options)
                if (!res.ok) {
                    const errorText = `${res.status} ${res.statusText}`
                    console.log(`error retrieving frag no ${frag.idx}: ${errorText}`)
                    throw new Error(errorText)
                }
                await streamPipeline(res.body, createWriteStream(storagePath))
                console.log(`Finished download ${frag.idx}`)
                frag.downloaded = true
                return frag
            })
            .pipe(
                retryWhen(errors => {
                    return errors.pipe(
                        mergeMap((error, attemptNo) => {
                            if (attemptNo + 1 > this.maxRetry) {
                                return throwError(() => error)
                            }
                            return timer(2000)
                        })
                    )
                }),
                catchError((error) => {
                    console.log(`Max retry exceeded, frag ${frag.idx} ${frag.storagePath}, error ${error}`)
                    return of(frag)
                })
            )

    }
}

export default new DownloadFrag
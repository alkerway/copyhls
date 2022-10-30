import { createReadStream, createWriteStream, move, readFileSync, rmSync } from 'fs-extra'
import { createDecipheriv } from 'crypto'

import { Frag } from "../types/frag";
import { Observable, of, from } from "rxjs";
import { decryptAES128Frags } from "../utils/config"

class FragDecrypter {
    public decryptIfConfigSaysSo = (frag: Frag): Observable<Frag> => {
        if (decryptAES128Frags && frag.key && frag.key.storagePath) {
            const IV = frag.key.iv?.replace('0x', '') || frag.originalMediaSequence.toString(16).padStart(32, '0')
            const tmpOutputPath = frag.storagePath + '.tmp.decrypt'
            const keyBuffer = readFileSync(frag.key.storagePath);
            const readStream = createReadStream(frag.storagePath, { highWaterMark: 1 << 16 });
            const writeStream = createWriteStream(tmpOutputPath)
            const decipher = createDecipheriv('aes-128-cbc', keyBuffer, Buffer.from(IV, 'hex')).setAutoPadding(false)

            const decryptionPromise = new Promise<Frag>((resolve) => {
                const onWriteComplete = () => {
                    rmSync(frag.storagePath)
                    move(tmpOutputPath, frag.storagePath)
                    frag.tagLines = frag.tagLines.filter((line) => !line.startsWith('#EXT-X-KEY'))
                    resolve(frag)
                }
                const onStreamError = (error: unknown) => {
                    console.error('Could not decrypt frag, leaving as is', error)
                    resolve(frag)
                }
                writeStream.on('finish', onWriteComplete)
                writeStream.on('error', onStreamError)
                readStream.on('error', onStreamError)
                readStream.pipe(decipher).pipe(writeStream)
            })

            return from(decryptionPromise)
        } else {
            return of(frag)
        }
    }
}

export default new FragDecrypter
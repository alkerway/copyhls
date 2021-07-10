import { catchError, defer, EMPTY, map, of } from "rxjs";
import { ExtKey, Frag } from "../types";
import { referer } from "../utils/config";
import { RemoteToFile } from "../utils/remoteToFile";


class DownloadKey {
    public download = (frag: Frag) => {
        if (frag.key) {
            return RemoteToFile(frag.key.remoteUrl, frag.key.storagePath)
                .pipe(
                    map(() => frag),
                    catchError((error: Error) => {
                        console.log(`Could not download key, ${error.message}`)
                        return of(frag)
                    })
                )
        } else {
            return of(frag)
        }
    }
}

export default new DownloadKey
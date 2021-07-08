import fetch, { RequestInit } from "node-fetch";

import Events from "../utils/events";
import { levelUrl, referer } from "../utils/config" 
import { catchError, EMPTY, from, Observable } from "rxjs";

class LevelRequest {
    public requestLevel = (): Observable<string> => {
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer
            }
        }
        return from(fetch(levelUrl, options)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error retrieving level: ${res.status}, ${res.statusText}`)
                }
                return res.text()
            }))
            .pipe(catchError(this.onLevelError))
    }

    public onLevelError = (error: Error) => {
        console.log(error.message)
        return EMPTY
    }
}

export default new LevelRequest
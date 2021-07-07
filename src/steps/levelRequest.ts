import fetch, { RequestInit } from "node-fetch";

import Events from "../utils/events";
import { levelUrl, referer } from "../utils/config" 

class LevelRequest {
    public requestLevel = () => {
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer
            }
        }
        fetch(levelUrl, options)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error retrieving level: ${res.status}, ${res.statusText}`)
                }
                return res.text()
            })
            .then(Events.onLevelResponse)
            .catch((err) => {
                console.log(err)
            })
    }
}

export default new LevelRequest
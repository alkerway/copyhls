import { ExtKey } from "./key";

export interface Frag {
    remoteUrl: string
    storagePath: string
    tagLines: string[]
    duration: number
    idx: number
    originalMediaSequence: number
    downloaded: boolean
    key: ExtKey | null
}
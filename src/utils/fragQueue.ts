import { Frag } from "../types"


class FragQueue {
    private frags: Frag[] = []

    public addFragsFromManifest = (manifestFrags: Frag[]) => {
        this.frags = this.frags.concat(manifestFrags)
    }

    public peekNextFrag = (): Frag | null => {
        if (!this.frags.length) {
            return null
        }
        return this.frags[0]
    }

    public shift = (): Frag | null => {
        const outFrag = this.frags.shift()
        return outFrag || null
    }
}

export default new FragQueue
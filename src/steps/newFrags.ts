import { Frag } from "../types/frag";
import Events from "../utils/events";


class NewFrags {
    private isFirstParse = true
    private mostRecentIdx = -1

    public getNewFrags = (allFrags: Frag[]) => {
        if (allFrags.length) {
            // live
            if (this.isFirstParse) {
                this.isFirstParse = false
                const headerTags = allFrags[0].tagLines
                const lastFrag = allFrags[allFrags.length - 1]
                const uniqueTags = headerTags.map((tag) => {
                    if (lastFrag.tagLines.find(lastTag => lastTag.indexOf(tag.split(':')[0]) > -1)) {
                        return ''
                    }
                    if (tag.indexOf('#EXT-X-MEDIA-SEQUENCE:') > -1) {
                        return `#EXT-X-MEDIA-SEQUENCE:${lastFrag.idx}`
                    }
                    return tag
                })
                .filter(tag => tag)
                lastFrag.tagLines = uniqueTags.concat(lastFrag.tagLines)
                this.mostRecentIdx = lastFrag.idx
                Events.onNewFrags([lastFrag])
            } else {
                const newFrags = allFrags.filter(f => this.mostRecentIdx < f.idx)
                if (newFrags.length) {
                    this.mostRecentIdx = newFrags[newFrags.length - 1].idx
                    Events.onNewFrags(newFrags)
                }
            }
        }
    }
}

export default new NewFrags
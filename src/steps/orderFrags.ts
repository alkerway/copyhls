import { Frag } from "../types/frag";


class OrderFrags {
    private lastProcessedFrag: Frag | null = null
    private unprocessedFrags: Frag[] = []
    
    public onDownload = (frag: Frag): Frag[] => {
        console.log(`Ordering frag received ${frag.idx}`)
        if (this.lastProcessedFrag === null) {
            this.lastProcessedFrag = frag
            if (frag.downloaded) {
                return [frag]
            } else {
                return []
            }
        }

        const fragsToSend = []
        this.unprocessedFrags.push(frag)
        this.unprocessedFrags.sort((a, b) => a.idx - b.idx)
        console.log(this.unprocessedFrags.map(f => f.idx))
        while (this.unprocessedFrags.length && this.unprocessedFrags[0].idx === this.lastProcessedFrag.idx + 1) {
            const newFrag = this.unprocessedFrags.shift() as Frag
            if (newFrag.downloaded) {
                fragsToSend.push(newFrag)
            }
            this.lastProcessedFrag = Object.assign({}, newFrag)
        }
        return fragsToSend
    }
}

export default new OrderFrags
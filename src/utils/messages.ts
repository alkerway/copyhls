import { Subject } from "rxjs";

class Messages { 
    public tickerCanceled = new Subject<void>()
    public firstFragIdx = new Subject<number>()

    public cancelTicker = () => {
        this.tickerCanceled.next()
    }

    public setFirstFragIdx = (idx: number) => {
        this.firstFragIdx.next(idx)
    }
}

export default new Messages()
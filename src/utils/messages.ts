import { Subject } from "rxjs";

class Messages { 
    public tickerCanceled = new Subject<void>()

    public cancelTicker = () => {
        this.tickerCanceled.next()
    }
}

export default new Messages()
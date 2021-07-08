import { Subject } from "rxjs";

import { Frag } from '../types/frag'

class Events { 
    public tickerCanceled = new Subject<void>()

    public cancelTicker = () => {
        this.tickerCanceled.next()
    }
}

export default new Events()
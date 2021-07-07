import { interval, startWith, takeUntil, timer } from 'rxjs'

import Events from "../utils/events"
import { tickSeconds, stopAfter } from "../utils/config"

class Ticker {
    constructor() {
        interval(tickSeconds * 1000)
            .pipe(takeUntil(Events.tickerCanceled))
            .pipe(startWith(0))
            .subscribe(Events.doTick)
        timer(stopAfter * 1000)
            .subscribe(Events.cancelTicker)
    }
}

export default Ticker
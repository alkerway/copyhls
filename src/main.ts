import Events from './utils/events'
import Ticker from './steps/ticker'
import LevelRequest from './steps/levelRequest'
import LevelParse from './steps/levelParse'
import NewFrags from './steps/newFrags'
import DownloadFrag from './steps/downloadFrag'


import { mergeAll, mergeMap } from 'rxjs'
import WriteToManifest from './steps/writeToManifest'

console.log('program start')

// main flow
Events.tick.subscribe(LevelRequest.requestLevel)
Events.levelResponse.subscribe(LevelParse.parseLevel)
Events.levelParsed.subscribe(NewFrags.getNewFrags)
Events.newFrags
    .pipe(mergeAll())
    .pipe(mergeMap(frag => DownloadFrag.download(frag), 2))
    .subscribe(WriteToManifest.write)

// other events


new Ticker()
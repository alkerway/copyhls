import {
  concatMap,
  map,
  mergeAll,
  mergeMap,
  interval,
  startWith,
  takeUntil,
  timer,
  race,
  combineLatestWith,
  forkJoin,
  tap,
} from "rxjs";

import LevelRequest from "./steps/levelRequest";
import LevelParse from "./steps/levelParse";
import FragFilter from "./steps/fragFilter";
import DownloadFrag from "./steps/downloadFrag";
import OrganizeFrags from "./steps/organizeFrags";
import WriteToManifest from "./steps/writeToManifest";
import Decrypter from "./steps/decryptFrag";
import Finished from "./steps/onFinish";

import {
  levelPollIntervalSeconds,
  stopAfter,
  maxConcurrentDownloads,
  initialUrl,
} from "./utils/config";
import Messages from "./utils/messages";
import DownloadKey from "./steps/downloadKey";
import InitialManifest from "./steps/initialManifest";
import PrepareManifest from "./steps/prepareManifest";
import { ZipArrays } from "./utils/zip-arrays";
import DownloadInitSegment from "./steps/downloadInitSegment";

console.log("program start");

const levelPollInterval = interval(levelPollIntervalSeconds * 1000).pipe(
  startWith(0),
  takeUntil(race(timer(stopAfter * 1000), Messages.tickerCanceled))
);

InitialManifest.getInitialManifest(initialUrl)
  .pipe(
    map(PrepareManifest.parseManifest),
    map(PrepareManifest.prepareLevels),

    combineLatestWith(levelPollInterval),
    map(([prepareLevelsOutput]) => prepareLevelsOutput),

    mergeMap((levels) => forkJoin(levels.map(LevelRequest.requestLevel))),
    map((levels) => levels.map(LevelParse.getFragsFromManifest)),
    map((levels) => levels.map(FragFilter.findNewFrags)),
    map(ZipArrays),
    mergeAll(),
    mergeMap(DownloadFrag.download, maxConcurrentDownloads),
    mergeMap(DownloadKey.download, maxConcurrentDownloads),
    mergeMap(DownloadInitSegment.download, maxConcurrentDownloads),
    map(OrganizeFrags.addToOrderedQueue),
    mergeAll(),
    mergeMap(Decrypter.decryptIfConfigSaysSo),
    concatMap(WriteToManifest.write)
  )
  .subscribe();

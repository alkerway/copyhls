### Copy Manifest Tool

#### Live

DVRs a given level manifest by polling and downloading fragments for a given amount of time, yielding an updating 
[event-type playlist](https://developer.apple.com/documentation/http_live_streaming/example_playlists_for_http_live_streaming/event_playlist_construction),
then stops and runs FFmpeg to create one single video.

#### Vod

Quickly downloads a given level manifest by concurrently downloading a configurable number of frags at once,
but still keeps the order and updates so that one can watch the video as a live manifest while it's downoading.

### Usage

* Have node and ffmpeg installed
* Create an empty manifest directory in the project root
* Specify the level url and download time in src/utils/config.ts
* run npm start

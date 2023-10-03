export const splitAttributes = (attributeList: string) => {
  const attributes = [];
  let currentAttribute = "";
  let withinQuotes = false;

  let canEscapeNextChar = false;
  attributeList.split("").forEach((char) => {
    const isEscapingCurrentChar = canEscapeNextChar && char === '"';

    if (char === "," && !withinQuotes) {
      attributes.push(currentAttribute);
      currentAttribute = "";
    } else {
      if (char === '"' && !isEscapingCurrentChar) {
        withinQuotes = !withinQuotes;
      }
      currentAttribute += char;
    }

    // escape next if character is backslash and backslash hasn't been escaped
    // by the last time looping
    canEscapeNextChar = char === "\\" && !canEscapeNextChar;
  });
  attributes.push(currentAttribute);
  return attributes;
};

export const getRemoteUrl = (line: string, levelUrl: string): string => {
  if (line.startsWith("http")) {
    return line;
  } else if (line.startsWith("/")) {
    const origin = levelUrl.split("/").slice(0, 3).join("/");
    return `${origin}${line}`;
  } else {
    const trimmedPath = levelUrl
      .split("?")[0]
      .split("/")
      .slice(0, -1)
      .join("/");
    return `${trimmedPath}/${line}`;
  }
};

export enum Tags {
  Inf = "#EXTINF",
  StreamInf = "#EXT-X-STREAM-INF",
  Discontinuity = "#EXT-X-DISCONTINUITY",
  Pdt = "#EXT-X-PROGRAM-DATE-TIME",
  Key = "#EXT-X-KEY",
  Media = "#EXT-X-MEDIA",
  Map = "#EXT-X-MAP",
  MediaSequence = "#EXT-X-MEDIA-SEQUENCE",
  DiscontinuitySequence = "#EXT-X-DISCONTINUITY-SEQUENCE",
  TargetDuration = "#EXT-X-TARGETDURATION",
  PlaylistType = "#EXT-X-PLAYLIST-TYPE",
  End = "#EXT-X-ENDLIST",
}

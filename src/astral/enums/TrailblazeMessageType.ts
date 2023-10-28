enum TrailblazeMessageType {
  PING = 0,
  PONG = 1,
  REQUEST_FILES = 2,
  FILE_START = 3,
  FILE_CHUNK = 4,
  FILE_END = 5,
  FILE_ACK = 6,
  RECEIVER_READY = 7
}

export { TrailblazeMessageType };

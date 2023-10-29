enum TrailblazeMessageType {
  PING = 0,
  PONG = 1,
  REQUEST_FILES = 2,
  FILE_READY = 3,
  RECEIVER_READY = 4,
  FILE_CHUNK = 5,
  FILE_END = 6,
  FILE_ACK = 7,
}

export { TrailblazeMessageType };

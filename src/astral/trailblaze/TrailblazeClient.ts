import { useReceiverStore, useSenderStore, useShareStore } from "../../state";
import { RTCConnector } from "../connectors";
import { ShareRole } from "../enums";
import {
  FileChunkTrailblazeMessage,
  FileChunksEndTrailblazeMessage,
  FilesRequestTrailblazeMessage,
} from "../models/trailblaze";

class TrailblazeClient {
  onReady = (rtc: RTCConnector) => {
    if (useShareStore.getState().role != ShareRole.Receiver) return;
    const files = useReceiverStore.getState().sharedMetadata;
    rtc.sendMessage(new FilesRequestTrailblazeMessage(files.map((f) => f.id)));
  };

  // onFileListRequest = (rtc: RTCConnector) => {
  //   if (useShareStore.getState().role != ShareRole.Sender) return;

  //   const metadata = Array.from(useSenderStore.getState().sharedFiles).map(
  //     ([id, file]) => FileMetadata.fromFile(id, file)
  //   );
  //   const fileList = new FileListTrailblazeMessage(metadata);

  //   rtc.sendMessage(fileList);
  // };

  // onFileList = (rtc: RTCConnector, files: FileMetadata[]) => {
  //   console.log(files);
  // };

  onFilesRequest = async (
    rtc: RTCConnector,
    request: FilesRequestTrailblazeMessage
  ) => {
    const file = useSenderStore.getState().sharedFiles.get(request.ids[0]);

    if (!file) {
      console.log("uh oh");
      return;
    }

    await rtc.sendFile(request.ids[0], file);

    // const SIZE = 65527;

    // // if (request.chunks.length == 0) {
    // // send all chunks
    // const fileChunks = Math.ceil(file.size / 65527);
    // let chunk = 0;

    // while (chunk != fileChunks) {
    //   const chunk_size =
    //     (chunk + 1) * SIZE < file.size ? (chunk + 1) * SIZE : file.size;

    //   const slice = file.slice(chunk * SIZE, chunk_size);
    //   //   remaining -= chunk_size - chunk * SIZE;
    //   const data = await slice.arrayBuffer();
    //   const bytes = new Uint8Array(data);

    //   const msg = new FileChunkTrailblazeMessage(request.ids[0], chunk, bytes);
    //   rtc.sendMessage(msg);
    //   console.log("Chunk " + chunk + " queued!");

    //   chunk += 1;
    // }
    // console.log(file.size);

    // const msg = new FileChunksEndTrailblazeMessage(request.ids[0]);
    // rtc.sendMessage(msg);

    return;
  };

  onFileChunk = (rtc: RTCConnector, chunk: FileChunkTrailblazeMessage) => {
    console.log("Received chunk:", chunk.chunk);
    useReceiverStore.getState().appendDl(chunk.id, chunk.chunk, chunk.data);
  };

  onFileChunksEnd = (rtc: RTCConnector, id: number) => {
    console.log("Ended: " + id);
    const arr = useReceiverStore.getState().tempDls.get(id);
    const meta = useReceiverStore
      .getState()
      .sharedMetadata.find((x) => x.id == id);

    if (!arr || !meta) {
      console.log("no dls?");
      return;
    }

    const ar = Array.from(Array(meta.chunk_count).keys());

    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v) {
        const index = ar.indexOf(i);
        if (index !== -1) {
          ar.splice(index, 1);
        }
      }
    }

    console.log(ar);

    // if (ar.length > 0) {
    //   const msg = new FileChunkRequestTrailblazeMessage(id, ar);
    //   rtc.sendMessage(msg);
    //   console.log("Requesting again:", ar);
    //   return;
    // }

    // console.log(arr.map(x => x.length).reduce((sum, a) => sum + a, 0));

    // console.log(arr.map((v, i, a) => [i, v]).filter((v, i, a) => v[1] == undefined));

    const file = new File(arr, meta.name);
    console.log(file.size);
    const url = window.URL.createObjectURL(file);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = meta.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    useReceiverStore.getState().removeDl(id);
  };
}

export { TrailblazeClient };

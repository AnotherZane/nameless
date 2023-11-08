onmessage = async (e) => {
  // Retrieve message sent to work from main script
  const message = e.data;

  // if (message.type == "create") {
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle(message.folder, {
    create: !message.start,
  });
  const file = await dir.getFileHandle(message.file, {
    create: !message.start,
  });

  const accessHandle = await file.createSyncAccessHandle();

  if (message.start) {
    // Hack for seeking since there's no method
    accessHandle.write(new Uint8Array(), { at: message.start });
    accessHandle.flush();
  }

  const ts = new TransformStream();
  ts.readable.pipeTo(
    new WritableStream({
      write(chunk) {
        return new Promise((resolve, reject) => {
          accessHandle.write(chunk);
          accessHandle.flush();
          resolve();
        });
      },
      close() {
        return new Promise((resolve, reject) => {
          accessHandle.close();
          resolve();
        });
      },
      abort(err) {
        console.log("Sink error:", err);
        return new Promise((resolve, reject) => {
          accessHandle.close();
          resolve();
        });
      },
    })
  );

  postMessage({ stream: ts.writable }, [ts.writable]);
  // }
};

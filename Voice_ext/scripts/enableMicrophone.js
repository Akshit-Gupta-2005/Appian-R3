navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function (stream) {
    console.log("Microphone access granted");
  })
  .catch(function (error) {
    console.error("Microphone access denied:", error);
  });

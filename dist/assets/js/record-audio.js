export let audio;

const recordAudioButton = document.getElementById("record-audio-button");
const recordedAudioPlayer = document.getElementById("recorded-audio");

if (recordAudioButton && recordedAudioPlayer) {
  recordAudioButton.addEventListener("click", async () => {
    recordAudioButton.disabled = true;
    recordAudioButton.textContent = "recording...";
    await recordAudio();
    recordAudioButton.hidden = true;
    recordedAudioPlayer.hidden = false;
  });
}

export const recordAudio = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(mediaStream);
  const audioChunks = [];

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });

  mediaRecorder.start();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  mediaRecorder.stop();

  await new Promise((resolve) => {
    mediaRecorder.addEventListener("stop", () => {
      resolve();
    });
  });

  audio = new Blob(audioChunks, { type: "audio/mp3" });

  const audioElement = document.querySelector("#recorded-audio");
  audioElement.src = URL.createObjectURL(audio);
};

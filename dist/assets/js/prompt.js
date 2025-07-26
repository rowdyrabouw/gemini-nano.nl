const apiSupport = document.querySelector("api-support");
const promptStatus = apiSupport.shadowRoot.querySelector("#prompt-status");
const promptDownloadButton = apiSupport.shadowRoot.querySelector("#prompt-download");
const promptError = document.querySelector("#prompt-error");
const promptInfo = document.querySelector("#prompt-info");
const promptAudioForm = document.querySelector("#prompt-audio-form");
const promptPoemForm = document.querySelector("#prompt-poem-form");
const promptOutput = document.querySelector("#prompt-output");

let availability;
let languageModel;

if ("LanguageModel" in self) {
  console.info("Prompt API is supported.");
  availability = await LanguageModel.availability();
  console.info(`Prompt API is ${availability}.`);
  promptStatus.textContent = availability;
  promptStatus.classList.remove("status-checking");
  promptStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    promptDownloadButton.hidden = false;
  }
} else {
  console.error("Prompt API is not supported.");
  availability = "not supported";
  promptStatus.textContent = availability;
  promptStatus.classList.remove("status-checking");
  promptStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

promptDownloadButton.addEventListener("click", async () => {
  promptStatus.textContent = "downloading";
  promptStatus.classList.add("status-downloading");

  languageModel = await LanguageModel.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        promptStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          promptStatus.textContent = "available";
          promptStatus.classList.remove("status-downloading");
          promptStatus.classList.add("status-available");
          console.info("Prompt API downloaded.");
        }
      });
    },
  });
});

if (promptAudioForm) {
  promptAudioForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      promptError.classList.add("error");
      promptError.textContent = `Prompt API is ${availability}.`;
      console.error(`Prompt API is ${availability}.`);
      return;
    }

    promptInfo.textContent = "Thinking ...";
    promptOutput.textContent = "";

    const formData = new FormData(promptAudioForm);
    const startTime = performance.now();

    const blob = await (await fetch("/assets/audio/neil.mp3")).blob();
    const arrayBuffer = await blob.arrayBuffer();

    const params = await LanguageModel.params();
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "audio" }],
      temperature: 0.1,
      topK: params.defaultTopK,
    });

    const stream = session.promptStreaming([
      {
        role: "user",
        content: [
          { type: "text", value: formData.get("prompt").trim() },
          { type: "audio", value: arrayBuffer },
        ],
      },
    ]);

    for await (const chunk of stream) {
      promptInfo.textContent = "Transcribing ...";
      promptOutput.textContent += chunk;
    }

    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    promptInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
  });
}

if (promptPoemForm) {
  promptPoemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      promptError.classList.add("error");
      promptError.textContent = `Prompt API is ${availability}.`;
      console.error(`Prompt API is ${availability}.`);
      return;
    }

    promptInfo.textContent = "Thinking ...";
    promptOutput.textContent = "";

    const formData = new FormData(promptPoemForm);
    const startTime = performance.now();

    const session = await LanguageModel.create();
    const stream = session.promptStreaming([
      {
        role: "user",
        content: [
          {
            type: "text",
            value: formData.get("prompt").trim(),
          },
        ],
      },
    ]);
    for await (const chunk of stream) {
      promptInfo.textContent = "Poeting ...";
      promptOutput.textContent += chunk;
    }

    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    promptInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
  });
}

const apiSupport = document.querySelector("api-support");
const summarizerStatus = apiSupport.shadowRoot.querySelector("#summarizer-status");
const summarizerDownloadButton = apiSupport.shadowRoot.querySelector("#summarizer-download");
const summarizerError = document.querySelector("#summarizer-error");
const summarizerInfo = document.querySelector("#summarizer-info");
const summarizerForm = document.querySelector("#summarizer-form");
const summarizerOutput = document.querySelector("#summarizer-output");
const languageDetectorContainer = document.querySelector("#language-detector-container");
const languageDetectorPrompt = document.querySelector("#language-detector-prompt");
const translatorPrompt = document.querySelector("#translator-prompt");

let availability;
let summarizer;

if ("Summarizer" in self) {
  console.info("Summarizer API is supported.");
  availability = await Summarizer.availability();
  console.info(`Summarizer API is ${availability}.`);
  summarizerStatus.textContent = availability;
  summarizerStatus.classList.remove("status-checking");
  summarizerStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    summarizerDownloadButton.hidden = false;
  }
} else {
  console.error("Summarizer API is not supported.");
  availability = "not supported";
  summarizerStatus.textContent = availability;
  summarizerStatus.classList.remove("status-checking");
  summarizerStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

summarizerDownloadButton.addEventListener("click", async () => {
  summarizerStatus.textContent = "downloading";
  summarizerStatus.classList.add("status-downloading");

  summarizer = await Summarizer.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        summarizerStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          summarizerStatus.textContent = "available";
          summarizerStatus.classList.add("status-available");
          console.info("Summarizer API downloaded.");
        }
      });
    },
  });
});

if (summarizerForm) {
  summarizerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      summarizerError.classList.add("error");
      summarizerError.textContent = `Summarizer API is ${availability}.`;
      console.error(`Summarizer API is ${availability}.`);
      return;
    }

    summarizerInfo.textContent = "Thinking ...";
    summarizerOutput.textContent = "";
    languageDetectorPrompt.textContent = "";

    const formData = new FormData(summarizerForm);
    const options = {
      sharedContext: formData.get("context").trim(),
      type: formData.get("type"),
      format: formData.get("format"),
      length: formData.get("length"),
    };
    const startTime = performance.now();
    summarizer = await Summarizer.create(options);
    const stream = summarizer.summarizeStreaming(formData.get("prompt").trim());
    for await (const chunk of stream) {
      summarizerInfo.textContent = "Writing ...";
      summarizerOutput.append(chunk);
      languageDetectorPrompt.append(chunk);
      translatorPrompt.append(chunk);
    }
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    summarizerInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
    languageDetectorContainer.hidden = false;
  });
}

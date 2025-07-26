const apiSupport = document.querySelector("api-support");
const summarizerStatus = apiSupport.shadowRoot.querySelector("#summarizer-status");
const summarizerDownloadButton = apiSupport.shadowRoot.querySelector("#summarizer-download");
const summarizerError = document.querySelector("#summarizer-error");
const summarizerForm = document.querySelector("#summarizer-form");
const summarizerOutput = document.querySelector("#summarizer-output");
const languageDetectorContainer = document.querySelector("#language-detector-container");
const languageDetectorPrompt = document.querySelector("#language-detector-prompt");

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

    summarizerOutput.textContent = "";
    languageDetectorPrompt.textContent = "";

    const formData = new FormData(summarizerForm);
    const options = {
      sharedContext: formData.get("context").trim(),
      type: formData.get("type"),
      format: formData.get("format"),
      length: formData.get("length"),
    };
    summarizer = await Summarizer.create(options);
    const stream = summarizer.summarizeStreaming(formData.get("prompt").trim());
    for await (const chunk of stream) {
      summarizerOutput.append(chunk);
      languageDetectorPrompt.append(chunk);
    }
    languageDetectorContainer.hidden = false;
  });
}

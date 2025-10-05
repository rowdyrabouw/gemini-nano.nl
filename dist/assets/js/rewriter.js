import { marked } from "./marked.esm.js";

const apiSupport = document.querySelector("api-support");
const reWriterStatus = apiSupport.shadowRoot.querySelector("#rewriter-status");
const reWriterDownloadButton = apiSupport.shadowRoot.querySelector("#rewriter-download");
const reWriterError = document.querySelector("#rewriter-error");
const reWriterInfo = document.querySelector("#rewriter-info");
const reWriterForm = document.querySelector("#rewriter-form");
const reWriterOutput = document.querySelector("#rewriter-output");
const reWriterContent = document.querySelector("#rewriter-content");
const reWriterPromptToggle = document.querySelector("#rewriter-prompt-toggle");
const reWriterPromptContainer = document.querySelector("#rewriter-prompt-container");
const summarizerContainer = document.querySelector("#summarizer-container");
const summarizerPrompt = document.querySelector("#summarizer-prompt");

let availability;
let reWriter;

if (reWriterPromptToggle) {
  reWriterPromptToggle.addEventListener("click", () => {
    reWriterPromptContainer.classList.toggle("sr-only");
  });
}

if ("Rewriter" in self) {
  console.info("Rewriter API is supported.");
  availability = await Rewriter.availability();
  console.info(`Rewriter API is ${availability}.`);
  reWriterStatus.textContent = availability;
  reWriterStatus.classList.remove("status-checking");
  reWriterStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    reWriterDownloadButton.hidden = false;
  }
} else {
  console.error("Rewriter API is not supported.");
  availability = "not supported";
  reWriterStatus.textContent = availability;
  reWriterStatus.classList.remove("status-checking");
  reWriterStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

reWriterDownloadButton.addEventListener("click", async () => {
  reWriterStatus.textContent = "downloading";
  reWriterStatus.classList.add("status-downloading");

  reWriter = await Rewriter.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        reWriterStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          reWriterStatus.textContent = "available";
          reWriterStatus.classList.remove("status-downloading");
          reWriterStatus.classList.add("status-available");
          console.info("Rewriter API downloaded.");
        }
      });
    },
  });
});

if (reWriterForm) {
  reWriterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      reWriterError.classList.add("error");
      reWriterError.textContent = `Rewriter API is ${availability}.`;
      console.error(`Rewriter API is ${availability}.`);
      return;
    }

    reWriterInfo.textContent = "Thinking ...";
    reWriterOutput.textContent = "";
    summarizerPrompt.textContent = "";

    const formData = new FormData(reWriterForm);
    const options = {
      tone: formData.get("tone"),
      format: formData.get("format"),
      length: formData.get("length"),
    };
    const startTime = performance.now();
    reWriter = await Rewriter.create(options);
    const stream = reWriter.rewriteStreaming(formData.get("prompt").trim());
    for await (const chunk of stream) {
      reWriterInfo.textContent = "Writing ...";
      reWriterOutput.append(chunk);
      reWriterContent.innerHTML = marked.parse(reWriterOutput.textContent);
      summarizerPrompt.append(chunk);
    }
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    reWriterInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
    summarizerContainer.hidden = false;
  });
}

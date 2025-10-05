import { marked } from "./marked.esm.js";

const apiSupport = document.querySelector("api-support");
const writerStatus = apiSupport.shadowRoot.querySelector("#writer-status");
const writerDownloadButton = apiSupport.shadowRoot.querySelector("#writer-download");
const writerError = document.querySelector("#writer-error");
const writerInfo = document.querySelector("#writer-info");
const writerForm = document.querySelector("#writer-form");
const writerOutput = document.querySelector("#writer-output");
const writerContent = document.querySelector("#writer-content");
const rewriterContainer = document.querySelector("#rewriter-container");
const rewriterPrompt = document.querySelector("#rewriter-prompt");

let availability;
let writer;

if ("Writer" in self) {
  console.info("Writer API is supported.");
  availability = await Writer.availability();
  console.info(`Writer API is ${availability}.`);
  writerStatus.textContent = availability;
  writerStatus.classList.remove("status-checking");
  writerStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    writerDownloadButton.hidden = false;
  }
} else {
  console.error("Writer API is not supported.");
  availability = "not supported";
  writerStatus.textContent = availability;
  writerStatus.classList.remove("status-checking");
  writerStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

writerDownloadButton.addEventListener("click", async () => {
  writerStatus.textContent = "downloading";
  writerStatus.classList.add("status-downloading");

  writer = await Writer.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        writerStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          writerStatus.textContent = "available";
          writerStatus.classList.remove("status-downloading");
          writerStatus.classList.add("status-available");
          console.info("Writer API downloaded.");
        }
      });
    },
  });
});

if (writerForm) {
  writerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      writerError.classList.add("error");
      writerError.textContent = `Writer API is ${availability}.`;
      console.error(`Writer API is ${availability}.`);
      return;
    }

    writerInfo.textContent = "Thinking ...";
    writerOutput.textContent = "";
    rewriterPrompt.textContent = "";

    const formData = new FormData(writerForm);
    const options = {
      tone: formData.get("tone"),
      format: formData.get("format"),
      length: formData.get("length"),
      outputLanguage: "en",
    };
    const startTime = performance.now();
    writer = await Writer.create(options);
    const stream = writer.writeStreaming(formData.get("prompt").trim());
    for await (const chunk of stream) {
      writerInfo.textContent = "Writing ...";
      writerOutput.append(chunk);
      writerContent.innerHTML = marked.parse(writerOutput.textContent);
      rewriterPrompt.append(chunk);
    }
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    writerInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
    rewriterContainer.hidden = false;
  });
}

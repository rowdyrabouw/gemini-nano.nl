import { marked } from "./marked.esm.js";

const apiSupport = document.querySelector("api-support");
const proofReaderStatus = apiSupport.shadowRoot.querySelector("#proofreader-status");
const proofReaderDownloadButton = apiSupport.shadowRoot.querySelector("#proofreader-download");
const proofReaderInfo = document.querySelector("#proofreader-info");
const proofReaderForm = document.querySelector("#proofreader-form");
const proofReaderOutput = document.querySelector("#proofreader-output");
const proofReaderContent = document.querySelector("#proofreader-content");

let availability;
let proofReader;

if ("Proofreader" in self) {
  console.info("Proofreader API is supported.");
  availability = await Proofreader.availability();
  console.info(`Proofreader API is ${availability}.`);
  proofReaderStatus.textContent = availability;
  proofReaderStatus.classList.remove("status-checking");
  proofReaderStatus.classList.add(`status-${availability}`);

  if (availability === "downloadable") {
    proofReaderDownloadButton.hidden = false;
  }
} else {
  console.error("Proofreader API is not supported.");
  availability = "not supported";
  proofReaderStatus.textContent = availability;
  proofReaderStatus.classList.remove("status-checking");
  proofReaderStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

proofReaderDownloadButton.addEventListener("click", async () => {
  proofReaderStatus.textContent = "downloading";
  proofReaderStatus.classList.add("status-downloading");

  proofReader = await Proofreader.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        proofReaderStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          proofReaderStatus.textContent = "available";
          proofReaderStatus.classList.add("status-available");
          proofReaderStatus.classList.remove("status-downloading");
          console.info("Proofreader API downloaded.");
        }
      });
    },
  });
});

if (proofReaderForm) {
  proofReaderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    proofReaderInfo.textContent = "Thinking ...";
    proofReaderOutput.textContent = "";

    const formData = new FormData(proofReaderForm);
    /* options for the proofreader are defined in the specification, but not implemented in Chrome yet */

    // const options = {
    //   includeCorrectionTypes: true,
    //   includeCorrectionExplanations: true,
    //   expectedInputLanguagues: ["en"],
    //   correctionExplanationLanguage: "en",
    // };
    const startTime = performance.now();
    // const proofreader = await Proofreader.create(options);

    const proofreader = await Proofreader.create();
    proofReaderInfo.textContent = "Proofreading ...";

    const corrections = await proofreader.proofread(formData.get("prompt").trim());
    console.info("Corrections:", corrections);
    proofReaderOutput.textContent = corrections.correctedInput;
    proofReaderContent.innerHTML = marked.parse(proofReaderOutput.textContent);

    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    proofReaderInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
  });
}

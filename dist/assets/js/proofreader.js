const supportedMessage = "Proofreader API is supported.";
const statusMessage = "Proofreader API is";
const notSupportedMessage = "Proofreader API is not supported.";
const apiSupport = document.querySelector("api-support");
const proofReaderStatus = apiSupport.shadowRoot.querySelector("#proofreader-status");
const proofReaderDownloadButton = apiSupport.shadowRoot.querySelector("#proofreader-download");
const proofReaderForm = document.querySelector("#proofreader-form");
const proofReaderOutput = document.querySelector("#proofreader-output");

let availability;
let proofReader;

if ("Proofreader" in self) {
  console.info(supportedMessage);
  availability = await Proofreader.availability();
  console.info(`${statusMessage} ${availability}.`);
  proofReaderStatus.textContent = availability;
  proofReaderStatus.classList.remove("status-checking");
  proofReaderStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    proofReaderDownloadButton.hidden = false;
  }
} else {
  console.error(notSupportedMessage);
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

    proofReaderOutput.textContent = "Proofreading ...";

    const formData = new FormData(proofReaderForm);
    /* options for the proofreader are defined in the specification, but not implemented in Chrome yet */
    /*
  const options = {
    includeCorrectionTypes: true,
    includeCorrectionExplanations: true,
    expectedInputLanguagues: ["en"],
    correctionExplanationLanguage: "en",
  };
  const proofreader = await Proofreader.create(options);
  */
    const proofreader = await Proofreader.create();

    const corrections = await proofreader.proofread(formData.get("input").trim());
    proofReaderOutput.textContent = corrections.correctedInput;
  });
}

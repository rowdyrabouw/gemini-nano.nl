const supportedMessage = "Prompt API is supported.";
const statusMessage = "Prompt API is";
const notSupportedMessage = "Prompt API is not supported.";
const apiSupport = document.querySelector("api-support");
const promptStatus = apiSupport.shadowRoot.querySelector("#prompt-status");
const promptDownloadButton = apiSupport.shadowRoot.querySelector("#prompt-download");

let availability;
let languageModel;

if ("LanguageModel" in self) {
  console.info(supportedMessage);
  availability = await LanguageModel.availability();
  console.info(`${statusMessage} ${availability}.`);
  promptStatus.textContent = availability;
  promptStatus.classList.remove("status-checking");
  promptStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    promptDownloadButton.hidden = false;
  }
} else {
  console.error(notSupportedMessage);
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

import { languages } from "./languages.js";

const apiSupport = document.querySelector("api-support");
const languageDetectorStatus = apiSupport.shadowRoot.querySelector("#language-detector-status");
const languageDetectorDownloadButton = apiSupport.shadowRoot.querySelector("#language-detector-download");
const languageDetectorError = document.querySelector("#language-detector-error");
const languageDetectorInfo = document.querySelector("#language-detector-info");
const languageDetectorForm = document.querySelector("#language-detector-form");
const languageDetectorOutput = document.querySelector("#language-detector-output");
const languagePromptToggle = document.querySelector("#language-detector-prompt-toggle");
const languagePromptContainer = document.querySelector("#language-detector-prompt-container");
const translatorContainer = document.querySelector("#translator-container");

let availability;
let languageDetector;

if (languagePromptToggle) {
  languagePromptToggle.addEventListener("click", () => {
    languagePromptContainer.classList.toggle("sr-only");
  });
}

if ("LanguageDetector" in self) {
  console.info("LanguageDetector API is supported.");
  availability = await LanguageDetector.availability();
  console.info(`LanguageDetector API is ${availability}.`);
  languageDetectorStatus.textContent = availability;
  languageDetectorStatus.classList.remove("status-checking");
  languageDetectorStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    languageDetectorDownloadButton.hidden = false;
  }
} else {
  console.error("LanguageDetector API is not supported.");
  availability = "not supported";
  languageDetectorStatus.textContent = availability;
  languageDetectorStatus.classList.remove("status-checking");
  languageDetectorStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

languageDetectorDownloadButton.addEventListener("click", async () => {
  languageDetectorStatus.textContent = "downloading";
  languageDetectorStatus.classList.add("status-downloading");

  languageDetector = await LanguageDetector.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        languageDetectorStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          languageDetectorStatus.textContent = "available";
          languageDetectorStatus.classList.add("status-available");
          languageDetectorStatus.classList.remove("status-downloading");
          console.info("LanguageDetector API downloaded.");
        }
      });
    },
  });
});

if (languageDetectorForm) {
  languageDetectorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      languageDetectorError.classList.add("error");
      languageDetectorError.textContent = `LanguageDetector API is ${availability}.`;
      console.error(`LanguageDetector API is ${availability}.`);
      return;
    }

    languageDetectorInfo.textContent = "Detecting language ...";
    languageDetectorOutput.textContent = "";

    const formData = new FormData(languageDetectorForm);
    const startTime = performance.now();
    languageDetector = await LanguageDetector.create();
    const result = await languageDetector.detect(formData.get("prompt").trim());
    result.forEach((item) => {
      const languageName = languages[item.detectedLanguage] || item.detectedLanguage;
      languageDetectorOutput.innerHTML += `<p>${languageName} (${(item.confidence * 100).toFixed(4)}%)</p>`;
    });
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(4);
    languageDetectorInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
    translatorContainer.hidden = false;
    const detectedLanguage = result.reduce((prev, current) => (prev.confidence > current.confidence ? prev : current));
    const sourceLanguageRadio = document.querySelector(`[name='source-language'][value='${detectedLanguage.detectedLanguage}']`);
    if (sourceLanguageRadio) {
      sourceLanguageRadio.checked = true;
      console.info("Source language set to:", detectedLanguage.detectedLanguage);
    }
  });
}

import { languages } from "./languages.js";

const apiSupport = document.querySelector("api-support");
const languageDetectorStatus = apiSupport.shadowRoot.querySelector("#language-detector-status");
const languageDetectorDownloadButton = apiSupport.shadowRoot.querySelector("#language-detector-download");
const languageDetectorError = document.querySelector("#language-detector-error");
const languageDetectorForm = document.querySelector("#language-detector-form");
const languageDetectorOutput = document.querySelector("#language-detector-output");
const translatorContainer = document.querySelector("#translator-container");

let availability;
let languageDetector;

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
      languageDetectorError.textContent = `LanguageDetector API is ${availability}.`;
      console.error(`LanguageDetector API is ${availability}.`);
      return;
    }

    languageDetectorOutput.textContent = "";

    const formData = new FormData(languageDetectorForm);
    languageDetector = await LanguageDetector.create();
    const result = await languageDetector.detect(formData.get("prompt").trim());
    result.forEach((item) => {
      const languageName = languages[item.detectedLanguage] || item.detectedLanguage;
      languageDetectorOutput.innerHTML += `<p>${languageName} (${(item.confidence * 100).toFixed(4)}%)</p>`;
    });

    translatorContainer.hidden = false;
  });
}

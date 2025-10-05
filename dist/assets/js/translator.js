import { marked } from "./marked.esm.js";
import { languages } from "./languages.js";

const apiSupport = document.querySelector("api-support");
const translatorStatus = apiSupport.shadowRoot.querySelector("#translator-status");
const translatorDownloadButton = apiSupport.shadowRoot.querySelector("#translator-download");
const translatorForm = document.querySelector("#translator-form");
const translatorError = document.querySelector("#translator-error");
const translatorInfo = document.querySelector("#translator-info");
const translatorOutput = document.querySelector("#translator-output");
const translatorContent = document.querySelector("#translator-content");
const translatorPromptToggle = document.querySelector("#translator-prompt-toggle");
const translatorPromptContainer = document.querySelector("#translator-prompt-container");

let availability;
let translator;

if (translatorPromptToggle) {
  translatorPromptToggle.addEventListener("click", () => {
    translatorPromptContainer.classList.toggle("sr-only");
  });
}

if ("Translator" in self) {
  console.info("Translator API is supported.");
  availability = await Translator.availability({
    sourceLanguage: "en",
    targetLanguage: "nl",
  });
  console.info(`Translator API is ${availability}.`);
  translatorStatus.textContent = availability;
  translatorStatus.classList.remove("status-checking");
  translatorStatus.classList.add(`status-${availability}`);
  if (availability === "downloadable") {
    translatorDownloadButton.hidden = false;
  }
} else {
  console.error("Translator API is not supported.");
  availability = "not supported";
  translatorStatus.textContent = availability;
  translatorStatus.classList.remove("status-checking");
  translatorStatus.classList.add(`status-${availability.replace(" ", "-")}`);
}

translatorDownloadButton.addEventListener("click", async () => {
  translatorStatus.textContent = "downloading";
  translatorStatus.classList.add("status-downloading");

  translator = await Translator.create({
    sourceLanguage: "en",
    targetLanguage: "nl",
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        translatorStatus.textContent = `downloading (${(e.loaded * 100).toFixed(2)}%)`;
        if (e.loaded === 1) {
          translatorStatus.textContent = "available";
          translatorStatus.classList.remove("status-downloading");
          translatorStatus.classList.add("status-available");
          console.info("Translator API downloaded.");
        }
      });
    },
  });
});

if (translatorForm) {
  translatorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (availability !== "available") {
      translatorError.classList.add("error");
      translatorError.textContent = `Translator API is ${availability}.`;
      console.error(`Translator API is ${availability}.`);
      return;
    }

    translatorInfo.textContent = "Thinking ...";
    translatorOutput.textContent = "";
    translatorError.classList.remove("error");
    translatorError.textContent = "";

    const formData = new FormData(translatorForm);
    const options = {
      sourceLanguage: formData.get("source-language"),
      targetLanguage: formData.get("target-language"),
    };
    const startTime = performance.now();
    try {
      translator = await Translator.create(options);
    } catch (error) {
      if (error.name === "NotSupportedError") {
        translatorInfo.textContent = "";
        translatorError.classList.add("error");
        translatorError.textContent = `Unable to translate from ${languages[options.sourceLanguage]} to ${languages[options.targetLanguage]}.`;
        return;
      }
      return;
    }

    const stream = translator.translateStreaming(formData.get("prompt").trim());
    translatorOutput.textContent = "";
    for await (const chunk of stream) {
      translatorInfo.textContent = "Writing ...";
      translatorOutput.append(chunk);
      translatorContent.innerHTML = marked.parse(translatorOutput.textContent);
    }
    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    translatorInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
  });
}

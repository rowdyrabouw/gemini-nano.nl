import { languages } from "./languages.js";

const apiSupport = document.querySelector("api-support");
const translatorStatus = apiSupport.shadowRoot.querySelector("#translator-status");
const translatorDownloadButton = apiSupport.shadowRoot.querySelector("#translator-download");
const translatorForm = document.querySelector("#translator-form");
const translatorError = document.querySelector("#translator-error");
const translatorOutput = document.querySelector("#translator-output");

let availability;
let translator;

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
      translatorError.textContent = `Translator API is ${availability}.`;
      console.error(`Translator API is ${availability}.`);
      return;
    }

    translatorOutput.textContent = "Translating...";

    const formData = new FormData(translatorForm);
    const options = {
      sourceLanguage: formData.get("source-language"),
      targetLanguage: formData.get("target-language"),
    };
    try {
      translator = await Translator.create(options);
    } catch (error) {
      if (error.name === "NotSupportedError") {
        translatorError.textContent = `Unable to translate from ${languages[options.sourceLanguage]} to ${languages[options.targetLanguage]}.`;
        translatorError.className = "error";
        return;
      }
      return;
    }

    const stream = translator.translateStreaming(formData.get("prompt").trim());
    translatorOutput.textContent = "";
    for await (const chunk of stream) {
      translatorOutput.append(chunk);
    }
  });
}

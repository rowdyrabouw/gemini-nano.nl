import { marked } from "./marked.esm.js";

const apiSupport = document.querySelector("api-support");
const proofReaderStatus = apiSupport.shadowRoot.querySelector("#proofreader-status");
const proofReaderDownloadButton = apiSupport.shadowRoot.querySelector("#proofreader-download");
const proofReaderInfo = document.querySelector("#proofreader-info");
const proofReaderForm = document.querySelector("#proofreader-form");
const proofReaderShowCorrections = document.querySelector("#showCorrections");
const proofReaderLegend = document.querySelector("#legend");
const proofReaderInput = document.querySelector("#proofreader-prompt");
const proofReaderCorrectionsContainer = document.querySelector("details");
const proofReaderCorrections = document.querySelector("#proofreader-corrections");
const proofReaderOutput = document.querySelector("#proofreader-output");
const proofReaderContent = document.querySelector("#proofreader-content");

let availability;

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
  const proofReaderLegendContent = document.querySelector("#legend").firstChild;

  proofReaderShowCorrections.addEventListener("change", (e) => {
    if (e.target.value === "yes") {
      proofReaderLegend.style.visibility = "visible";
    } else {
      proofReaderLegend.style.visibility = "hidden";
    }
  });

  const errorHighlights = {
    spelling: null,
    punctuation: null,
    capitalization: null,
    preposition: null,
    "missing-words": null,
    grammar: null,
  };
  const errorTypes = Object.keys(errorHighlights);

  const preTrimStartLength = proofReaderLegendContent.textContent.length;
  const postTrimStartLength = proofReaderLegendContent.textContent.trimStart().length;
  let offset = preTrimStartLength - postTrimStartLength;
  proofReaderLegendContent.textContent
    .trimStart()
    .split(" ")
    .forEach((word, i) => {
      if (!errorTypes[i]) {
        return;
      }
      const range = new Range();
      range.setStart(proofReaderLegendContent, offset);
      offset += word.length;
      range.setEnd(proofReaderLegendContent, offset);
      const highlight = new self.Highlight(range);
      errorHighlights[errorTypes[i]] = highlight;
      CSS.highlights.set(errorTypes[i], highlight);
      offset += 1;
    });

  proofReaderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    proofReaderInfo.textContent = "Thinking ...";
    proofReaderOutput.textContent = "";
    proofReaderContent.innerHTML = "";

    const formData = new FormData(proofReaderForm);
    const showCorrections = formData.get("showCorrections") === "yes";
    const options = {
      includeCorrectionTypes: showCorrections,
      includeCorrectionExplanations: showCorrections,
      expectedInputLanguagues: ["en"],
      correctionExplanationLanguage: "en",
    };
    const startTime = performance.now();
    const proofreader = await Proofreader.create(options);

    proofReaderInfo.textContent = "Proofreading ...";

    const corrections = await proofreader.proofread(proofReaderInput.textContent.trim());

    if (showCorrections) {
      const textNode = proofReaderInput.firstChild;
      for (const correction of corrections.corrections) {
        const range = new Range();
        range.setStart(textNode, correction.startIndex);
        range.setEnd(textNode, correction.endIndex);
        correction.type ||= "other";
        errorHighlights[correction.type].add(range);
      }
      proofReaderCorrectionsContainer.style.display = "block";
      proofReaderCorrections.textContent = JSON.stringify(corrections.corrections, null, 2);
    }

    proofReaderOutput.textContent = corrections.correctedInput;
    proofReaderContent.innerHTML = marked.parse(proofReaderOutput.textContent);

    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    proofReaderInfo.textContent = `Done in ${seconds} seconds!`;
    console.info(`Request took ${seconds} seconds`);
  });
}

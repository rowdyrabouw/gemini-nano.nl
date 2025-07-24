class ApiSupport extends HTMLElement {
  static get observedAttributes() {
    return ["writer", "rewriter", "summarizer", "language-detector", "translator", "prompt", "proofreader"];
  }

  constructor() {
    super();
    this.shadowDom = this.attachShadow({ mode: "open" });
    this.render();
    this.writer = this.shadowRoot.querySelector("#writer");
    this.rewriter = this.shadowRoot.querySelector("#rewriter");
    this.summarizer = this.shadowRoot.querySelector("#summarizer");
    this.languageDetector = this.shadowRoot.querySelector("#language-detector");
    this.translator = this.shadowRoot.querySelector("#translator");
    this.prompt = this.shadowRoot.querySelector("#prompt");
    this.proofreader = this.shadowRoot.querySelector("#proofreader");
  }

  render() {
    this.shadowDom.innerHTML = `
      <style>@import "/assets/css/api-support.css";</style>
      <div id="status-container">
        <div id="writer" hidden>
          <span>Writer API</span>
          <span id="writer-status" class="status status-checking">checking</span>
          <button hidden type="button" id="writer-download"><img src="/assets/svg/download.svg" alt="Download Writer API"></button>
        </div>
        <div id="rewriter" hidden>
          <span>Rewriter API</span>
          <span id="rewriter-status" class="status status-checking">checking</span>
          <button hidden type="button" id="rewriter-download"><img src="/assets/svg/download.svg" alt="Download Rewriter API"></button>
        </div>
        <div id="summarizer" hidden>
          <span>Summarizer API</span>
          <span id="summarizer-status" class="status status-checking">checking</span>
          <button hidden type="button" id="summarizer-download"><img src="/assets/svg/download.svg" alt="Download Summarizer API"></button>
        </div>
        <div id="language-detector" hidden>
          <span>Language Detector API</span>
          <span id="language-detector-status" class="status status-checking">checking</span>
          <button hidden type="button" id="language-detector-download"><img src="/assets/svg/download.svg" alt="Download Language Detector API"></button>
        </div>
        <div id="translator" hidden>
          <span>Translator API</span>
          <span id="translator-status" class="status status-checking">checking</span>
          <button hidden type="button" id="translator-download"><img src="/assets/svg/download.svg" alt="Download Translator API"></button>
        </div>
        <div id="prompt" hidden>
          <span>Prompt API</span>
          <span id="prompt-status" class="status status-checking">checking</span>
          <button hidden type="button" id="prompt-download"><img src="/assets/svg/download.svg" alt="Download Prompt API"></button>
        </div>
        <div id="proofreader" hidden>
          <span>Proofreader API</span>
          <span id="proofreader-status" class="status status-checking">checking</span>
          <button hidden type="button" id="proofreader-download"><img src="/assets/svg/download.svg" alt="Download Proofreader API"></button>
        </div>
      </div>
    `;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    switch (attrName) {
      case "writer":
        this.writer.hidden = false;
        break;
      case "rewriter":
        this.rewriter.hidden = false;
        break;
      case "summarizer":
        this.summarizer.hidden = false;
        break;
      case "language-detector":
        this.languageDetector.hidden = false;
        break;
      case "translator":
        this.translator.hidden = false;
        break;
      case "prompt":
        this.prompt.hidden = false;
        break;
      case "proofreader":
        this.proofreader.hidden = false;
        break;
    }
  }
}

customElements.define("api-support", ApiSupport);

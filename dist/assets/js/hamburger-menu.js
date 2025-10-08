class HamburgerMenu extends HTMLElement {
  shadowDom;

  static get observedAttributes() {
    return ["current-page"];
  }

  constructor() {
    super();
    this.shadowDom = this.attachShadow({ mode: "open" });
    this.render();
    this.home = this.shadowRoot.querySelector("#home");
    this.writingAssistance = this.shadowRoot.querySelector("#writing-assistance");
    this.proofreader = this.shadowRoot.querySelector("#proofreader");
    this.promptImage = this.shadowRoot.querySelector("#prompt-image");
    this.promptAudio = this.shadowRoot.querySelector("#prompt-audio");
    this.promptPoem = this.shadowRoot.querySelector("#prompt-poem");
    this.myHamburger = this.shadowRoot.querySelector("#hamburger");
    this.myNavMenu = this.shadowRoot.querySelector("#navMenu");
    this.closeNavMenu = this.shadowRoot.querySelector("#closeNavMenu");
    this.myMenuLinks = this.shadowRoot.querySelector("nav button, nav a");
    this.myHamburger.addEventListener(
      "click",
      () => {
        if (this.myNavMenu.classList.contains("hidden")) {
          this.doMenuOpen();
        } else {
          this.doMenuClose();
        }
      },
      false
    );
    this.closeNavMenu.addEventListener(
      "click",
      () => {
        this.doMenuClose();
      },
      false
    );
    this.shadowRoot.addEventListener(
      "keyup",
      (e) => {
        // 27 = ESC key
        if (e.keyCode === 27) {
          this.doMenuClose();
        }
      },
      false
    );
  }

  render() {
    this.shadowDom.innerHTML = `
      <style>@import "/assets/css/hamburger-menu.css";</style>
        <nav aria-labelledby="hamburger">
          <button id="hamburger" class="button hamburger" aria-label="Show Navigation Menu" aria-expanded="false">☰</button>
          <div id="navMenu" class="navMenu hidden">
            <button id="closeNavMenu" class="button closeBtn" aria-label="Hide Navigation Menu">×</button>
            <ul>
              <li><a id="home" href="/">Home</a></li>
              <li><a id="writing-assistance" href="/writing-assistance">Writing Assistance</a></li>
              <li><a id="proofreader" href="/proofreader">Proofreader</a></li>
              <li><a id="prompt" href="/prompt">Prompt</a></li>
              <li><a id="prompt-image" href="/prompt-image">Prompt Image</a></li>
              <li><a id="prompt-audio" href="/prompt-audio">Prompt Audio</a></li>
              <li><a id="prompt-poem" href="/prompt-poem">Prompt Poem</a></li>
            </ul>
          </div>
        </nav>
    `;
  }

  doMenuOpen() {
    this.myHamburger.setAttribute("aria-expanded", true);
    this.myNavMenu.classList.remove("hidden");
    this.myHamburger.classList.add("menuOpen");
  }

  doMenuClose() {
    this.myHamburger.setAttribute("aria-expanded", false);
    this.myNavMenu.classList.add("hidden");
    this.myHamburger.classList.remove("menuOpen");
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    switch (newValue) {
      case "home":
        this.home.setAttribute("aria-current", "page");
        break;
      case "writing-assistance":
        this.writingAssistance.setAttribute("aria-current", "page");
        break;
    }
  }
}

customElements.define("hamburger-menu", HamburgerMenu);

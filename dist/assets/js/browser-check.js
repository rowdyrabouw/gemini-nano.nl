const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
if (!isChrome) {
  const header = document.querySelector("header");
  header.style.display = "none";
  const main = document.querySelector("main");
  main.style.paddingBlockStart = "32px";
  const errorText = "Sorry, this website only works in Chrome at the moment.";
  const browserError = document.querySelector("#browser-error");
  browserError.classList.add("error");
  browserError.textContent = errorText;
  console.error(errorText);
}

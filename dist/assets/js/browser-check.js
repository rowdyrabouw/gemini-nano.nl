const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
if (!isChrome) {
  const apiSupport = document.querySelector("api-support");
  apiSupport.style.visibility = "hidden";
  const errorText = "Sorry, this website only works in Chrome at the moment.";
  const browserError = document.querySelector("#browser-error");
  browserError.classList.add("error");
  browserError.textContent = errorText;
  console.error(errorText);
}

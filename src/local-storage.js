const elementSaveFile = JSON.parse(localStorage.getItem('elementSaveFile') || '[]');

elementSaveFile.push = function (...args) {
  Array.prototype.push.apply(elementSaveFile, args);

  localStorage.setItem('elementSaveFile', JSON.stringify(elementSaveFile));
}

const isDarkMode = JSON.parse(localStorage.getItem('elementDarkMode') || 'false');
function setIsDarkMode(isDarkMode) {
  localStorage.setItem('elementDarkMode', JSON.stringify(isDarkMode));
}

const elementSaveFile = JSON.parse(localStorage.getItem('elementSaveFile') || '[]');
elementSaveFile.push = function (...args) {
  Array.prototype.push.apply(elementSaveFile, args);
  localStorage.setItem('elementSaveFile', JSON.stringify(elementSaveFile));
}

const packSaveFile = JSON.parse(localStorage.getItem('elementPackSaveFile') || '[]');
packSaveFile.push = function (...args) {
  Array.prototype.push.apply(packSaveFile, args);
  localStorage.setItem('elementPackSaveFile', JSON.stringify(packSaveFile));
}

const isDarkMode = JSON.parse(localStorage.getItem('elementDarkMode') || 'false');
function setIsDarkMode(isDarkMode) {
  localStorage.setItem('elementDarkMode', JSON.stringify(isDarkMode));
}

const elementSavefile = [...new Set(JSON.parse(localStorage.getItem('elementSavefile') || '[]'))];
elementSavefile.push = function (arg) {
  if (!elementSavefile.includes(arg)) {
    Array.prototype.push.apply(elementSavefile, [arg]);
    localStorage.setItem('elementSavefile', JSON.stringify(elementSavefile));
  }
};

const packSavefile = JSON.parse(localStorage.getItem('elementPackSavefile') || '[]');
packSavefile.push = function (...args) {
  Array.prototype.push.apply(packSavefile, args);
  localStorage.setItem('elementPackSavefile', JSON.stringify(packSavefile));
};

const isDarkMode = JSON.parse(localStorage.getItem('elementDarkMode') || 'false');
function setIsDarkMode(isDarkMode) {
  localStorage.setItem('elementDarkMode', JSON.stringify(isDarkMode));
}

const elementSavefile = [...new Set(JSON.parse(localStorage.getItem('elementSavefile') || '[]'))];
elementSavefile.push = function (arg) {
  if (!elementSavefile.includes(arg)) {
    Array.prototype.push.apply(elementSavefile, [arg]);
    localStorage.setItem('elementSavefile', JSON.stringify(elementSavefile));
  }
};

const packSavefile = JSON.parse(localStorage.getItem('elementPackSavefile') || '[]')
  .filter((x) => !x[0].startsWith('builtin:'));
packSavefile.push = function (...args) {
  Array.prototype.push.apply(packSavefile, args);
  localStorage.setItem('elementPackSavefile', JSON.stringify(packSavefile));
};

const disabledSavefile = JSON.parse(localStorage.getItem('elementPackDisabled') || '[]');
disabledSavefile.add = function (arg) {
  if (!disabledSavefile.includes(arg)) {
    disabledSavefile.push(arg);
    localStorage.setItem('elementPackDisabled', JSON.stringify(disabledSavefile));
    return true;
  }
  return false;
};
disabledSavefile.remove = function (arg) {
  if (disabledSavefile.includes(arg)) {
    disabledSavefile.splice(disabledSavefile.indexOf(arg), 1);
    localStorage.setItem('elementPackDisabled', JSON.stringify(disabledSavefile));
    return true;
  }
  return false;
};

const isDarkMode = JSON.parse(localStorage.getItem('elementDarkMode') || 'false');
function setIsDarkMode(isDarkMode) {
  localStorage.setItem('elementDarkMode', JSON.stringify(isDarkMode));
}
const showPackIDs = JSON.parse(localStorage.getItem('elementSPID') || 'false');
function setShowPackIDs(isDarkMode) {
  localStorage.setItem('elementSPID', JSON.stringify(isDarkMode));
}

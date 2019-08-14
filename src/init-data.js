// load and manage loading the built in packs, also handles loading screen.

function fetchAndRegisterElementPack(url, enabled) {
  // handle disabling it
  const loaded = JSON.parse(localStorage.getItem('elementBuiltInDisabledLoaded') || '[]');
  if (enabled === false && !loaded.includes(url)) {
    localStorage.setItem('elementBuiltInDisabledLoaded', JSON.stringify(loaded.concat(url)));
    disabledSavefile.add('builtin:' + url);
  }

  // load it
  fetch(url)
    .then((r) => r.text())
    .then((text) => (registerElementData(text, 'builtin:' + url, enabled), text));
}

Promise.all([
  fetchAndRegisterElementPack('./elements/elemental2.txt'),
  fetchAndRegisterElementPack('./elements/experiments.txt', false),
  // ...add more default packs
]).then(() => {
  document.getElementById('loading').remove();
  document.getElementById('actualGame').removeAttribute('style');
});

packSavefile.forEach(([id, data]) => registerElementData(data, id));

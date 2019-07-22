// load and manage loading the built in packs, also handles loading screen.

function fetchAndRegisterElementPack(url) {
  fetch(url)
    .then((r) => r.text())
    .then((text) => (registerElementData(text, 'builtin:' +url), text));
}

Promise.all([
  fetchAndRegisterElementPack('./elements/elemental2.txt'),
  // ...add more default packs
]).then(() => {
  document.getElementById('loading').remove();
  document.getElementById('actualGame').removeAttribute('style');
});

packSavefile.forEach(([id, data]) => registerElementData(data, id));

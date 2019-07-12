// load and manage loading the built in packs, also handles loading screen.

function fetchAndRegisterElementPack(url) {
  if (packSaveFile.find((x) => x[0] === 'builtin:' + url)) return;

  fetch(url)
    .then(r => r.text())
    .then(text => (registerElementData(text, 'builtin:' +url), text))
    .then(text => packSaveFile.push(['builtin:' + url, text]));
}

Promise.all([
  fetchAndRegisterElementPack('./elements/elemental2.txt'),
  fetchAndRegisterElementPack('./elements/elemental3.txt'),
  // ...add more default packs
]).then(() => {
  document.getElementById('loading').remove();
  document.getElementById('actualGame').removeAttribute('style');
});

packSaveFile.forEach(([id, data]) => registerElementData(data, id));

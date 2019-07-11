// load and manage loading the built in packs, also handles loading screen.

function fetchAndRegisterElementData(url) {
  fetch(url).then(r => r.text()).then(text => registerElementData(text))
}

Promise.all([
  fetchAndRegisterElementData('./elements/elemental2.txt'),
  // ...add more
]).then(() => {
  document.getElementById('loading').remove();
  document.getElementById('actualGame').removeAttribute('style');
});

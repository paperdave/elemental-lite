const packsToLoad = [];
const builtInPacks = [];

function addPackToLoad(data, id, defaultEnabled) {
  packsToLoad.push({ id, data, defaultEnabled });
}

function registerAllPacks() {
  const sortedAndParsedPacks = packsToLoad
    .sort((a, b) => {
      const ab = a.id.startsWith('builtin');
      const bb = b.id.startsWith('builtin');
      return (ab === bb) ? 0 : ab ? -1 : 1;
    })
    .map((pack) => ({
      id: pack.id,
      data: pack.data,
      parsed: parseElementData(pack.data, pack.id),
      defaultEnabled: pack.defaultEnabled,
    }));
  const loadedPackIds = [];
  const beforeRequirements = {};
  sortedAndParsedPacks.forEach(pack => {
    const loadBefore = pack.parsed.find((x) => x.type === 'loadBefore');
    if (loadBefore) {
      loadBefore.listedIds.forEach(dependency => {
        beforeRequirements[dependency] = (beforeRequirements[dependency] || []).concat(pack.id);
      });
    }
  });
  while (sortedAndParsedPacks.length > 0) {
    const pack = sortedAndParsedPacks[0];
    if (loadedPackIds.includes(pack.id)) {
      throw new Error(`Pack ID ${pack.id} in use already.`);
    }
    let notLoadYet = false;
    const loadAfter = pack.parsed.find((x) => x.type === 'loadAfter');
    if (loadAfter) {
      if (sortedAndParsedPacks.find(pack => loadAfter.listedIds.includes(pack.id))) {
        notLoadYet = true;
      }
    }
    pack.parsed.filter(x => x.type === 'import').forEach((imp) => {
      if (sortedAndParsedPacks.find(pack => pack.id === imp.packID)) {
        notLoadYet = true;
      }
    });
    if (beforeRequirements[pack.id] && beforeRequirements[pack.id].find(d => !loadedPackIds.includes(d))) {
      notLoadYet = true;
    }
    if (notLoadYet) {
      sortedAndParsedPacks.shift();
      sortedAndParsedPacks.push(pack);
    } else {
      console.log('Loading ' + pack.id);
      registerElementData(pack.data, pack.id, true);
      loadedPackIds.push(pack.id);
      sortedAndParsedPacks.shift();
    }
  }
}


// load and manage loading the built in packs, also handles loading screen.
function registerBuiltInPack(id, url, defaultEnabled = true) {
  // handle disabling it
  const loaded = JSON.parse(localStorage.getItem('elementBuiltInDisabledLoaded') || '[]');
  if (defaultEnabled === false && !loaded.includes(url)) {
    localStorage.setItem('elementBuiltInDisabledLoaded', JSON.stringify(loaded.concat(url)));
    disabledSavefile.add('builtin:' + url);
  }

  // load it
  return fetch(url)
    .then((r) => r.text())
    .then((text) => (addPackToLoad(text, id, defaultEnabled), text));
}

packSavefile.forEach(([id, data]) => addPackToLoad(data, id));

Promise.all([
  registerBuiltInPack('elemental2', './elements/elemental2.txt'),
  registerBuiltInPack('example', './elements/experiments.txt', false),
  // ...add more default packs
]).then(() => {
  registerBuiltInPack('base', './elements/base.txt').then(() => {
    registerAllPacks();
  
    document.getElementById('loading').remove();
    document.getElementById('actualGame').removeAttribute('style');
  });
});

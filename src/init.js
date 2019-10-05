const packsToLoad = [];
const builtInPacks = [];
let isSafeMode = false;

function addPackToLoad(data, id, defaultEnabled, builtin) {
  packsToLoad.push({ id, data, defaultEnabled, builtin });
}

let allSortedAndParsedPacks;

function registerAllPacks() {
  const sortedAndParsedPacks = packsToLoad
    .sort(function compare(a, b) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    })
    .sort((a, b) => {
      const ab = a.id.startsWith('builtin');
      const bb = b.id.startsWith('builtin');
      return (ab === bb) ? 0 : ab ? -1 : 1;
    })
    .map((pack) => {
      try {
        return {
          id: pack.id,
          data: pack.data,
          parsed: parseElementData(pack.data, pack.id, true),
          defaultEnabled: pack.defaultEnabled,
          builtin: pack.builtin,
        };
      } catch (error) {
        throw new Error(`Error Loading Pack "${pack.id}": ${error.message}`);
      }
    });
  allSortedAndParsedPacks = sortedAndParsedPacks.concat();
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
  const delayReasons = {};
  while (sortedAndParsedPacks.length > 0) {
    const pack = sortedAndParsedPacks[0];
    if (loadedPackIds.includes(pack.id)) {
      throw new Error(`Pack ID ${pack.id} in use already.`);
    }
    let notLoadYet = false;
    const loadAfter = pack.parsed.find((x) => x.type === 'loadAfter');
    if (loadAfter) {
      let x = sortedAndParsedPacks.find(pack => loadAfter.listedIds.includes(pack.id));
      if (x) {
        notLoadYet = 'loadAfter:' + x.id;
      }
    }
    pack.parsed.filter(x => x.type === 'import').forEach((imp) => {
      let x = sortedAndParsedPacks.find(pack => pack.id === imp.packID);
      if (x) {
        notLoadYet = 'import:' + x.id;
      }
    });
    if (beforeRequirements[pack.id]) {
      let x = beforeRequirements[pack.id].find(d => !loadedPackIds.includes(d));
      if(x) {
        notLoadYet = 'loadBefore:' + x;
      }
    }
    if (notLoadYet && !(delayReasons[pack.id] && delayReasons[pack.id].includes(notLoadYet))) {
      delayReasons[pack.id] = delayReasons[pack.id] || [];
      delayReasons[pack.id].push(notLoadYet);
      sortedAndParsedPacks.shift();
      sortedAndParsedPacks.push(pack);
      allSortedAndParsedPacks = allSortedAndParsedPacks.filter(x => x !== pack).concat(pack);
    } else {
      if(notLoadYet) {
        // eslint-disable-next-line no-console
        console.warn('Found a circular reference involving ' + pack.id);
      }

      // eslint-disable-next-line no-console
      console.log('Loading ' + pack.id);
      try {
        registerElementData(pack.data, pack.id, true, pack.builtin);
      } catch (error) {
        throw new Error(`Error Loading Pack "${pack.id}": ${error.message}`);
      }
      loadedPackIds.push(pack.id);
      sortedAndParsedPacks.shift();
    }
  }
}


// load and manage loading the built in packs, also handles loading screen.
function registerBuiltInPack(id, url, defaultEnabled = true) {
  // handle disabling it
  const loaded = JSON.parse(localStorage.getItem('elementBuiltInDisabledLoaded') || '[]');
  if (defaultEnabled === false && !loaded.includes(id)) {
    localStorage.setItem('elementBuiltInDisabledLoaded', JSON.stringify(loaded.concat(id)));
    disabledSavefile.add(id);
  }

  // load it
  return fetch(url)
    .then((r) => r.text())
    .then((text) => (addPackToLoad(text, id, defaultEnabled, true), text));
}

packSavefile.forEach(([id, data]) => addPackToLoad(data, id));

Promise.all([
  registerBuiltInPack('elemental2', './elements/elemental2.txt'),
  registerBuiltInPack('base', './elements/base.txt'),
  // ...add more default packs
]).then(() => {
  try {
    registerAllPacks();
    document.getElementById('loading').remove();
    document.getElementById('actualGame').removeAttribute('style');
  } catch (error) {
    const packError = error.message.match(/Pack "(.*?)"/)[1];
    isSafeMode = true;
    document.getElementById('loading').remove();
    document.getElementById('safeMode').removeAttribute('style');
    document.getElementById('error-info').innerText = error.message;
    const target = document.getElementById('errorpackeditor');
    const packTitleFormattedError = document.createElement('span');
    packTitleFormattedError.innerText = ' <---- [ERROR]';
    packTitleFormattedError.style.color = 'red';
    packTitleFormattedError.style.fontStyle = 'italic';
    allSortedAndParsedPacks.forEach((pack) => {
      const titleNode = pack.parsed.find((x) => x.type === 'title');
      let title = titleNode ? titleNode.title : 'Unnamed Pack';
      const packTitleFormattedId = document.createElement('span');
      packTitleFormattedId.innerText = ' <' + pack.id + '>';
      packTitleFormattedId.style.color = '#666';
      const packTitle = [
        document.createTextNode(title),
        packTitleFormattedId,
        packError === pack.id ? packTitleFormattedError : null,
      ];
      AddPackOptions(
        packTitle,
        pack.id,
        pack.data,
        pack.builtin,
        target
      );
    });

    document.getElementById('safecontent').appendChild(document.getElementById('pack-div-bottom'));
  }
});

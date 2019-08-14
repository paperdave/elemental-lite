// Manages what elements and combinations exist
const elements = {};
const elementStats = {};
const comments = {};
const combos = {};
const colors = { none: 'initial' };

const colorStyleTag = document.createElement('style');
document.head.appendChild(colorStyleTag);

function toInternalName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.substring(1))
    .join('');
}
const colorCssMap = ['none'];
function toCSSValidName(name) {
  if (!colorCssMap.includes(name)) {
    colorCssMap.push(name);
  }
  return 'color' + colorCssMap.indexOf(name);
}

function registerColor(name, css) {
  const internalName = toInternalName(name);

  if (internalName in colors) {return;}
  colors[internalName] = { css, name };

  colorStyleTag.sheet.insertRule(`.${toCSSValidName(internalName)} { ${css} }`, 0);
}

let nextID = 0;

function getStats(name) {
  const internalName = toInternalName(name);
  if (!elementStats[internalName]) {
    elementStats[internalName] = {
      // how many combos this is used in; easy
      uses: 0,
      // how many combos this creates; easy
      creates: 0,
      // how long the tree is; hard
      complexity: null,
      // the least complex recipe that creates this; hard
      simplestRecipe: null,
    };
  }
  return elementStats[internalName];
}

function registerElement(name, color, recipe1, recipe2, disguise) {
  const internalName = toInternalName(name);
  const newElement = !(internalName in elements);
  if (newElement) {
    elements[internalName] = {
      id: ++nextID,
      name,
      color: toInternalName(color),
      disguise: disguise && toInternalName(disguise),
    };
  }

  if (recipe1 && recipe2) {
    if (recipe1 > recipe2) {
      const temp = recipe1;
      recipe1 = recipe2;
      recipe2 = temp;
    }

    const key = toInternalName(recipe1) + '+' + toInternalName(recipe2);

    if (!combos[key]) { combos[key] = []; }
    if (!combos[key].includes(internalName)) { combos[key].push(internalName); }

    if (newElement && elementSavefile.includes(internalName)) {
      addElementToGame(elements[internalName]);
    }

    getStats(name).uses++;
    getStats(recipe1).creates++;
    getStats(recipe2).creates++;
  } else if (newElement) {
    addElementToGame(elements[internalName]);
  }
}

const packDiv = document.getElementById('pack-div');

function setNeedsReload() {
  document.getElementById('reload-tip').style.display = 'contents';
}

function registerElementData(data, id) {
  const items = parseElementData(data, id);
  const isBuiltIn = id.startsWith('builtin:');
  const disabled = disabledSavefile.includes(id);
  let title = 'Unnamed Pack #' + parseInt(id).toString(36).toUpperCase().substr(0, 5);
  items.forEach((entry) => {
    if (entry.type === 'title') {
      title = entry.title;
    }
    if (!disabled) {
      if (entry.type === 'color') {
        registerColor(entry.name, entry.css);
      } else if (entry.type === 'element') {
        registerElement(entry.result, entry.color, entry.elem1, entry.elem2, entry.disguise);
      } else if (entry.type === 'comment') {
        const internalName = toInternalName(entry.elem);
        if (!comments[internalName]) {
          comments[internalName] = new Set();
        }
        comments[internalName].add(entry.comment);
      }
    }
  });

  const packLi = document.createElement('li');
  packLi.appendChild(document.createTextNode('- '));

  const packRemoveButton = document.createElement('button');
  packRemoveButton.appendChild(document.createTextNode('Remove'));
  if (!isBuiltIn) {
    packRemoveButton.addEventListener('click', () => {
      ShowDialog('Delete Pack ' + title, 'You can add it back if you want later.', ['YES', 'NO'])
        .then((choice) => {
          if (choice === 0) {
            let item = JSON.parse(localStorage.getItem('elementPackSavefile'));
            item = item.filter((item) => item[0] !== id);
            localStorage.setItem('elementPackSavefile', JSON.stringify(item));

            packLi.style.opacity = 0.2;
            packLi.style.pointerEvents = 'none';

            setNeedsReload();
          }
        });
    });
  } else {
    packRemoveButton.setAttribute('disabled', true);
  }
  packLi.appendChild(packRemoveButton);
  const packEditButton = document.createElement('button');
  packEditButton.appendChild(document.createTextNode('Edit'));
  if (!isBuiltIn) {
    packEditButton.addEventListener('click', () => {
      showPackDialog(data, true, id);
    });
  } else {
    packEditButton.setAttribute('disabled', true);
  }
  packLi.appendChild(packEditButton);

  const packCopyButton = document.createElement('button');
  packCopyButton.appendChild(document.createTextNode('Copy Code'));
  packCopyButton.addEventListener('click', () => {
    clipboard.writeText(location.href.replace(/#.*/, '') + '#add:' + btoa(data)).then(() => {
      setStatusText('Copied Pack Code');
    });
  });
  packLi.appendChild(packCopyButton);

  const packDownloadButton = document.createElement('button');
  packDownloadButton.appendChild(document.createTextNode('Download'));
  packDownloadButton.addEventListener('click', () => {
    download(data, title, '.txt', 'text/plain');
  });
  packLi.appendChild(packDownloadButton);

  const packEnableDisableButton = document.createElement('input');
  packEnableDisableButton.type = 'checkbox';
  packEnableDisableButton.checked = !disabled;
  packEnableDisableButton.addEventListener('change', (ev) => {
    if (packEnableDisableButton.checked) {
      disabledSavefile.remove(id);
    } else {
      disabledSavefile.add(id);
    }
    setNeedsReload();
  });
  packLi.appendChild(packEnableDisableButton);

  const packText = document.createElement('span');
  packText.appendChild(document.createTextNode(title));
  packText.classList.add('name');
  packLi.appendChild(packText);

  if (isBuiltIn) {
    packDiv.insertBefore(packLi, packDiv.firstChild);
  } else {
    packDiv.appendChild(packLi);
  }

  updateElementCounter();
}

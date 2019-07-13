// Manages what elements and combinations exist
const elements = {};
const combos = {};
const colors = {};

const colorStyleTag = document.createElement('style');
document.head.appendChild(colorStyleTag);

function toInternalName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.substring(1))
    .join('');
}

function registerColor(name, color) {
  const internalName = toInternalName(name);

  if (internalName in colors) {return;}
  colors[internalName] = { color, name };

  const rgb = parseInt(color.substring(1), 16);
  const r = rgb >> 16 & 0xff;
  const g = rgb >> 8 & 0xff;
  const b = rgb >> 0 & 0xff;
  // calculate color brightness
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (brightness > 100) {
    colorStyleTag.sheet.insertRule(`.${internalName} { background-color: ${color} }`, 0);
  } else {
    colorStyleTag.sheet.insertRule(`.${internalName} { background-color: ${color}; color: white }`, 0);
  }
}

let nextID = 1;

function registerElement(name, color, recipe1, recipe2) {
  const internalName = toInternalName(name);
  const newElement = !(internalName in elements);
  if (newElement) {
    elements[internalName] = {
      id: ++nextID,
      name,
      color: toInternalName(color),
    };
  }

  if (recipe1 && recipe2) {
    if (recipe1 > recipe2) {
      const temp = recipe1;
      recipe1 = recipe2;
      recipe2 = temp;
    }
    combos[toInternalName(recipe1) + '+' + toInternalName(recipe2)] = internalName;

    if (newElement && elementSavefile.includes(internalName)) {
      addElementToGame(elements[internalName]);
    }
  } else if (newElement) {
    addElementToGame(elements[internalName]);
  }
}

const packDiv = document.getElementById('pack-div');

function registerElementData(data, id) {
  const items = parseElementData(data);
  let title = 'Unnamed Pack';
  items.forEach((entry) => {
    if (entry.type === 'color') {
      registerColor(entry.name, entry.color);
    } else if (entry.type === 'element') {
      registerElement(entry.result, entry.color, entry.elem1, entry.elem2);
    } else if (entry.type === 'title') {
      title = entry.title;
    }
  });

  const packLi = document.createElement('li');
  const packText = document.createTextNode(title);
  packLi.appendChild(packText);

  if (!id.startsWith('builtin:')) {
    const packRemoveButton = document.createElement('button');
    packRemoveButton.appendChild(document.createTextNode('Remove'));
    packRemoveButton.addEventListener('click', () => {
      ShowDialog('Delete Pack ' + title, 'You can add it back if you want later.', ['YES', 'NO'])
        .then((choice) => {
          if (choice === 0) {
            let item = JSON.parse(localStorage.getItem('elementPackSavefile'));
            item = item.filter((item) => item[0] !== id);
            localStorage.setItem('elementPackSavefile', JSON.stringify(item));

            localStorage.setItem('openOptionsOnLoad', true);
            location.reload();
          }
        });
    });
    packLi.appendChild(packRemoveButton);

    const packCopyButton = document.createElement('button');
    packCopyButton.appendChild(document.createTextNode('Copy Code'));
    packCopyButton.addEventListener('click', () => {
      clipboard.writeText(btoa(data)).then(() => {
        setStatusText('Copied Pack Code');
      });
    });
    packLi.appendChild(packCopyButton);
  }

  packDiv.appendChild(packLi);

  updateElementCounter();
}

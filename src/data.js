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

  if (internalName in colors) return;
  colors[internalName] = { color, name };

  const rgb = parseInt(color.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const value = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  if (value > 100) {
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
    }
  }

  if (recipe1 && recipe2) {
    if (recipe1 > recipe2) {
      const temp = recipe1;
      recipe1 = recipe2;
      recipe2 = temp;
    }
    combos[toInternalName(recipe1) + '+' + toInternalName(recipe1)] = internalName;

    if (newElement && elementSaveFile.includes(internalName)) {
      addElementToGame(elements[internalName]);
    }
  } else {
    if (newElement) {
      addElementToGame(elements[internalName]);
    }
  }
}

function registerElementData(data) {
  const items = parseElementData(data);
  items.forEach((entry) => {
    if (entry.type === 'color') {
      registerColor(entry.name, entry.color);
    } else if(entry.type === 'element') {
      registerElement(entry.result, entry.color, entry.elem1, entry.elem2)
    }
  });
}

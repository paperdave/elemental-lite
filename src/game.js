// The actual game ui
const elementContainer = document.getElementById('elements');
const statusContainer = document.getElementById('status');

let holdingElement = null;
let holdingElementDom = null;

document.addEventListener('mousemove', (ev) => {
  if (holdingElementDom) {
    holdingElementDom.style.left = ev.pageX - 2 + 'px';
    holdingElementDom.style.top = ev.pageY + 2 + 'px';
  }
  statusContainer.style.left = ev.pageX + 10 + 'px';
  statusContainer.style.top = ev.pageY + 12 + 'px';
});
document.addEventListener('click', (ev) => {
  if (!(ev.target && ev.target.classList && ev.target.classList.contains('elem'))) {
    holdingElement = null;
    if (holdingElementDom) {
      holdingElementDom.remove();
      holdingElementDom = null;
    }
  }
});

let merges = 0;
let hiddenHelper = false;
function fadeHelper() {
  if (!hiddenHelper) {
    hiddenHelper = true;
    document.getElementById('helper').classList.add('animate-helper-out');
  }
}

function setStatusText(text) {
  statusContainer.innerText = text;
  if (!statusContainer.classList.contains('show')) {
    statusContainer.classList.add('show');
    setTimeout(() => {
      statusContainer.classList.remove('show');
    }, 1000);
  }
}

// Makes the HTML for an element
function ElementDom({ color, name }) {
  const elem = document.createElement('div');
  elem.appendChild(document.createTextNode(name));
  elem.className = `elem ${color}`;
  return elem;
}
// Adds an element and has most element logic
function addElementToGame(element) {
  const alreadyExistingDom = document.querySelector(`[data-element="${element.id}"]`);
  if (alreadyExistingDom) {
    if (!alreadyExistingDom.classList.contains('animate-bounce')) {
      alreadyExistingDom.classList.add('animate-bounce');
      setTimeout(() => {
        alreadyExistingDom.classList.remove('animate-bounce');
      }, 600);
    }
    return;
  }

  elementSaveFile.push(toInternalName(element.name));

  const dom = ElementDom(element);

  dom.addEventListener('click', (ev) => {
    if (holdingElement) {
      const id1 = toInternalName(element.name);
      const id2 = toInternalName(holdingElement.name);

      let combo;
      if (id1 < id2) {
        combo = id1 + '+' + id2;
      } else {
        combo = id2 + '+' + id1;
      }
      if (combos[combo]) {
        const elem = elements[combos[combo]];
        const alreadyExistingDom = document.querySelector(`[data-element="${elem.id}"]`);
        if (alreadyExistingDom) {
          setStatusText('Rediscovered Element: ' + elem.name + '.');
        } else {
          setStatusText('New Element: ' + elem.name + '.');
          merges++;
          if (merges == 3) {
            fadeHelper();
          }
        }
        addElementToGame(elem);
      } else {
        setStatusText('Discovered Nothing.')
      }

      holdingElement = null;
      if (holdingElementDom) {
        holdingElementDom.remove();
        holdingElementDom = null;
      }
    } else {
      if (!statusContainer.classList.contains('hide')) {
        statusContainer.classList.add('hide');
        statusContainer.classList.remove('show');
        setTimeout(() => {
          statusContainer.classList.remove('hide');
        }, 50);
      }

      holdingElement = element;

      holdingElementDom = ElementDom(element);
      holdingElementDom.classList.add('held');
      holdingElementDom.style.left = ev.pageX - 2 + 'px';
      holdingElementDom.style.top = ev.pageY + 2 + 'px';
      document.body.appendChild(holdingElementDom);
    }
  });

  dom.setAttribute('data-element', element.id);

  dom.classList.add('animate-in');
  setTimeout(() => {
    dom.classList.remove('animate-in');
  }, 600);

  let categoryDiv = elementContainer.querySelector(`[data-category="${element.color}"]`);
  if (!categoryDiv) {
    const header = document.createElement('h3');
    header.appendChild(document.createTextNode(colors[element.color].name));
    elementContainer.appendChild(header);
    categoryDiv = document.createElement('div');
    categoryDiv.setAttribute('data-category', element.color);
    elementContainer.appendChild(categoryDiv);
  }
  categoryDiv.appendChild(dom);
}

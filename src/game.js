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

let timer = false;
function setStatusText(text) {
  if (timer) {clearTimeout(timer);}
  statusContainer.innerText = text;
  if (!statusContainer.classList.contains('show')) {
    statusContainer.classList.add('show');
    timer = setTimeout(() => {
      statusContainer.classList.remove('show');
      timer = false;
    }, 1000);
  }
}

const elemCounter = document.getElementById('elem-count');
function updateElementCounter() {
  elemCounter.innerText = `${elementSavefile.length} / ${Object.keys(elements).length + 1}`;
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

  elementSavefile.push(toInternalName(element.name));
  updateElementCounter();

  const dom = ElementDom(element);

  dom.addEventListener('click', (ev) => {
    const foundElems = [];
    function tryCombo(id1, id2) {
      const combo = id1 + '+' + id2;
      if (combos[combo]) {
        combos[combo].forEach((elemID) => {
          if (foundElems.includes(elements[elemID])) {
            return;
          }
          const elem = elements[elemID];
          foundElems.push(elem);
        });
      }
    }

    if (holdingElement) {
      const id1 = toInternalName(element.name);
      const id2 = toInternalName(holdingElement.name);

      tryCombo(id1, id2);
      tryCombo(id2, id1);
      tryCombo('*', id1);
      tryCombo('*', id2);
      tryCombo(id1, '*');
      tryCombo(id2, '*');
      tryCombo(`(${element.color})`, id2);
      tryCombo(`(${holdingElement.color})`, id1);
      tryCombo(`(${element.color})`, `${holdingElement.color}`);
      tryCombo(`(${holdingElement.color})`, `${element.color}`);

      if (foundElems.length !== 0) {
        merges++;
        if (merges === 3) {
          fadeHelper();
        }
        const text = foundElems
          .map((elem) => {
            const alreadyExistingDom = document.querySelector(`[data-element="${elem.id}"]`);
            if (alreadyExistingDom) {
              return 'Rediscovered Element: ' + elem.name + '.';
            }
            return 'New Element: ' + elem.name + '.';
          })
          .join('\n');
        setStatusText(text);

        foundElems.forEach((elem) => addElementToGame(elem));
      } else {
        setStatusText('Discovered Nothing.');
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

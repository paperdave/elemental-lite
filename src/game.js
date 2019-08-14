// The actual game ui
const elementContainer = document.getElementById('elements');
const statusContainer = document.getElementById('status');
const infoContainer = document.getElementById('info-pane');

let infoOpen = false;
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
  if (!(ev.path && ev.path.includes(infoContainer))) {
    if (infoOpen) {
      infoContainer.style.display = 'none';
      infoOpen = false;
    }
  }
});
document.addEventListener('contextmenu', (ev) => {
  if (ev.path && ev.path.includes(infoContainer)) {
    infoOpen = false;
    infoContainer.style.display = 'none';
    ev.preventDefault();
  }
});
document.getElementById('elements').addEventListener('scroll', (ev) => {
  infoOpen = false;
  infoContainer.style.display = 'none';
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
  const total = Object.keys(elements).length;
  const has = elementSavefile.filter((x) => x in elements).length;
  elemCounter.innerText = `${has} / ${total} (${((total === 0 ? 1 : has / total) * 100).toFixed(1)}%)`;
}

// Makes the HTML for an element
function ElementDom({ color, disguise, name }) {
  const elem = document.createElement('div');
  elem.appendChild(document.createTextNode(name));
  elem.className = `elem ${toCSSValidName(disguise || color)}`;
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

  dom.addEventListener('contextmenu', (ev) => {
    holdingElement = null;
    if (holdingElementDom) {
      holdingElementDom.remove();
      holdingElementDom = null;
    }
    ev.preventDefault();

    dom.style.height = '100px';
    dom.style.top = '-10px';
    dom.scrollIntoView({ block: 'nearest' });
    dom.style.height = '';
    dom.style.top = '';

    const rect = dom.getBoundingClientRect();

    const flipY = rect.top > innerHeight - 200 - 32;
    const flipX = rect.left > innerWidth - 460 - 32;

    infoContainer.style.left = rect.left - 10 - (flipX ? 460 - 80 - 20 : 0) + 'px';
    infoContainer.style.top = rect.top - 10 - (flipY ? 200 - 80 - 20 : 0) + 'px';
    infoContainer.style.flexDirection = flipX ? 'row-reverse' : 'row';
    infoContainer.querySelector('#info-elem').style.alignSelf = flipY ? 'flex-end' : 'flex-start';

    setTimeout(() => {
      infoContainer.style.display = 'flex';
      infoOpen = true;
    }, 0);

    const stats = elementStats[toInternalName(element.name)];

    infoContainer.querySelector('#info-elem').className = 'elem ' + toCSSValidName(element.disguise || element.color);
    infoContainer.querySelector('#info-elem').innerText = element.name;
    infoContainer.querySelector('#info-id').innerText = element.id;
    infoContainer.querySelector('#info-combo').innerText = stats.uses;
    infoContainer.querySelector('#info-uses').innerText = stats.creates;

    const commentDiv = infoContainer.querySelector('#info-comments');
    while (commentDiv.firstChild) {
      commentDiv.removeChild(commentDiv.firstChild);
    }

    (comments[toInternalName(element.name)] || []).forEach((comment) => {
      commentDiv.innerHTML += converter.makeHtml(comment);
    });
  });

  dom.setAttribute('data-element', element.id);

  dom.classList.add('animate-in');
  setTimeout(() => {
    dom.classList.remove('animate-in');
  }, 600);

  let categoryDiv = elementContainer.querySelector(`[data-category="${element.color}"]`);
  if (!categoryDiv) {
    const header = document.createElement('h3');
    header.appendChild(document.createTextNode(colors[element.color].name.replace(/^LOCAL@.*@/, '')));
    elementContainer.appendChild(header);
    categoryDiv = document.createElement('div');
    categoryDiv.setAttribute('data-category', element.color);
    elementContainer.appendChild(categoryDiv);
  }
  categoryDiv.appendChild(dom);
}

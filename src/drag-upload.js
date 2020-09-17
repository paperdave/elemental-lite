let isDragging = false;
let dragOffTimer = null;
function setDragging(value) {
  if (!value) {
    if (dragOffTimer) {
      clearTimeout(dragOffTimer);
    }
    dragOffTimer = setTimeout(() => {
      isDragging = false;
      dragOffTimer = null;
      document.body.classList.remove('is-dropping-file');
    }, 500);
  } else {
    isDragging = true;
    if (dragOffTimer) {
      clearTimeout(dragOffTimer);
      dragOffTimer = null;
    }
    document.body.classList.add('is-dropping-file');
  }
}

function cancelEvent(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();
}

document.body.addEventListener('dragenter', (ev) => {
  cancelEvent(ev);
  setDragging(true);
});
document.body.addEventListener('dragover', (ev) => {
  cancelEvent(ev);

  setDragging(true);
});
document.body.addEventListener('drop', (ev) => {
  cancelEvent(ev);

  const file = ev.dataTransfer.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    // try base64 decode
    const source = event.target.result;
    let text = source;
    try {
      text = atob(text.trim());
    } catch (error) {
      /* Nothing */
    }

    const id = Math.random().toString().substr(2);

    try {
      registerElementData(text, id);
    } catch (error) {
      const errorPre = document.createElement('pre');
      const errorCode = document.createElement('code');
      errorPre.appendChild(errorCode);
      errorCode.appendChild(document.createTextNode(error.toString()));

      ShowDialog(
        'Error Parsing Data',
        errorPre,
        ['Ok']
      );

      return;
    }

    packSavefile.push([id, text]);
  };
  try {
    reader.readAsText(file);
  } catch (error) {
    setDragging(false);
  }

  document.body.classList.remove('is-dropping-file');
  setDragging(false);
});
document.body.addEventListener('dragleave', (ev) => {
  cancelEvent(ev);

  setDragging(false);
});

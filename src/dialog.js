// Handles a simple dialog popup
let dialogOpen = false;
function ShowDialog(title, textContent, buttons) {
  if (dialogOpen) {return;}
  return new Promise((done) => {
    dialogOpen = true;
    const dialogRoot = document.getElementById('dialog');
    dialogRoot.style.display = 'block';

    document.getElementById('dialog_title').textContent = title;

    const textContainer = document.getElementById('dialog_text_content');

    while (textContainer.firstChild) {
      textContainer.removeChild(textContainer.firstChild);
    }

    if (typeof textContent === 'string') {
      textContainer.appendChild(document.createTextNode(textContent));
    } else if (Array.isArray(textContent)) {
      textContent.forEach((elem) => {
        if (typeof elem === 'string') {
          textContainer.appendChild(document.createTextNode(elem));
        } else {
          textContainer.appendChild(elem);
        }
      });
    } else {
      textContainer.appendChild(textContent);
    }

    const buttonsDiv = document.getElementById('dialog_buttons');

    buttons.forEach((button, i) => {
      button = typeof button === 'string' ? { label: button } : button;

      const btn = document.createElement('button');
      btn.appendChild(document.createTextNode(button.label));
      btn.addEventListener('click', () => {
        dialogRoot.style.display = 'none';

        while (buttonsDiv.firstChild) {
          buttonsDiv.removeChild(buttonsDiv.firstChild);
        }

        dialogOpen = false;

        done(i);
      });
      buttonsDiv.appendChild(btn);
    });
  });
}

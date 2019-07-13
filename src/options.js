// The options UI
const changelogContent = document.getElementById('changelog');
const changelogButton = document.getElementById('openChangelog');
const optionsContent = document.getElementById('options');
const optionsButton = document.getElementById('openOptions');
let changelogOpen = false;
let optionsOpen = false;

changelogButton.addEventListener('click', () => {
  changelogOpen = !changelogOpen;
  if (optionsOpen) {
    optionsOpen = false;
    optionsContent.style.flexBasis = 0;
    optionsButton.classList.remove('buttonSelected');
  }
  if (changelogOpen) {
    changelogContent.style.flexBasis = Math.min(500, innerHeight - 30) + 'px';
    changelogButton.classList.add('buttonSelected');
  } else {
    changelogContent.style.flexBasis = 0;
    changelogButton.classList.remove('buttonSelected');
  }
});

optionsButton.addEventListener('click', () => {
  optionsOpen = !optionsOpen;
  if (changelogOpen) {
    changelogOpen = false;
    changelogContent.style.flexBasis = 0;
    changelogButton.classList.remove('buttonSelected');
  }
  if (optionsOpen) {
    optionsContent.style.flexBasis = Math.min(500, innerHeight - 30) + 'px';
    optionsButton.classList.add('buttonSelected');
  } else {
    optionsContent.style.flexBasis = 0;
    optionsButton.classList.remove('buttonSelected');
  }
});

const darkModeCheckbox = document.getElementById('dark-mode');
darkModeCheckbox.checked = !isDarkMode;
darkModeCheckbox.addEventListener('change', () => {
  if (darkModeCheckbox.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  setIsDarkMode(darkModeCheckbox.checked);
});
darkModeCheckbox.click();

document.getElementById('delete-button').addEventListener('click', () => {
  if (confirm('Delete All Data')) {
    localStorage.removeItem('elementSavefile');
    location.reload();
  }
});

const packAddBtn = document.getElementById('pack-add-btn');

function showPackDialog(initCode) {
  const infoParagraph = document.createElement('p');
  infoParagraph.appendChild(document.createTextNode(
    'Enter in the pack information into the text box and press Add.'
  ));
  const textField = document.createElement('textarea');
  textField.value = initCode;
  textField.classList.add('elem-pack-field');

  ShowDialog(
    'Add Element Pack',
    [
      infoParagraph,
      textField,
    ],
    [
      { label: 'Add' },
      { label: 'Cancel' },
    ]
  ).then((choice) => {
    if (choice === 0) {
      // try base64 decode
      const source = textField.value;
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
        ).then(() => {
          showPackDialog(source);
        });

        return;
      }

      packSavefile.push([id, text]);
    }
  });
}

packAddBtn.addEventListener('click', () => {
  showPackDialog('');
});

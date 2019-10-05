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
const ShowIDCheckbox = document.getElementById('show-pack-id');
ShowIDCheckbox.checked = !showPackIDs;
ShowIDCheckbox.addEventListener('change', () => {
  if (ShowIDCheckbox.checked) {
    document.body.classList.remove('hide-pack-ids');
  } else {
    document.body.classList.add('hide-pack-ids');
  }
  setShowPackIDs(ShowIDCheckbox.checked);
});
ShowIDCheckbox.click();

document.getElementById('delete-button').addEventListener('click', () => {
  ShowDialog(
    'Delete All Save Data',
    'This does not delete your element packs',
    ['YES', 'NO']
  ).then((choice) => {
    if (choice === 0) {
      localStorage.removeItem('elementSavefile');
      location.reload();
    }
  });
});

const packAddBtn = document.getElementById('pack-add-btn');

function showPackDialog(initCode, isEditMode, packID) {
  const infoParagraph = document.createElement('p');
  infoParagraph.appendChild(document.createTextNode(
    'Enter in the pack information into the text box and press Add.'
  ));
  const textField = document.createElement('textarea');
  textField.value = initCode;
  textField.classList.add('elem-pack-field');

  ShowDialog(
    isEditMode ? 'Edit Element Pack' : 'Add Element Pack',
    [
      infoParagraph,
      textField,
    ],
    [
      { label: isEditMode ? 'Save' : 'Add' },
      { label: 'Cancel' },
    ]
  ).then((choice) => {
    if (choice === 0) {
      // try base64 decode
      const source = textField.value;
      let text = source.replace(/^https?:\/\/.*?#add:(.*)$/, '$1');
      try {
        text = atob(text.trim());
      } catch (error) {
        /* Nothing */
      }

      let id = Math.random().toString().substr(2);

      try {
        if (isEditMode) {
          id = packID;
          const list = parseElementData(text);
          const idMatch = list.find(x => x.type === 'id');
          if (idMatch) {
            id = idMatch.id;
          }
          packSavefile.find((x) => x[0] === packID)[1] = text;
          packSavefile.find((x) => x[0] === packID)[0] = id;
          localStorage.setItem('elementPackSavefile', JSON.stringify(packSavefile));
        } else {
          const list = registerElementData(text, id, false);
          const idMatch = list.find(x => x.type === 'id');
          if(idMatch) {
            id = idMatch.id;
          }
        }
        setNeedsReload();
      } catch (error) {
        const errorPre = document.createElement('pre');
        const errorCode = document.createElement('code');
        errorPre.appendChild(errorCode);
        errorCode.appendChild(document.createTextNode(error.toString()));

        // eslint-disable-next-line no-console
        console.error(error);

        ShowDialog(
          'Error Parsing Data',
          errorPre,
          ['Ok']
        ).then(() => {
          showPackDialog(source, isEditMode, packID);
        });

        return;
      }

      if (!isEditMode) {
        packSavefile.push([id, text]);
      }
    }
  });
}

packAddBtn.addEventListener('click', () => {
  showPackDialog('');
});
document.getElementById('btn-reload').addEventListener('click', () => {
  localStorage.setItem('elementOpenOptionsOnLoad', 'oh hell yeah');
  location.reload();
});

if (localStorage.elementOpenOptionsOnLoad) {
  localStorage.removeItem('elementOpenOptionsOnLoad');
  optionsButton.click();
}

window.addEventListener('load', () => {
  function onPopState() {
    if (location.hash.startsWith('#add:')) {
      let text = location.hash.substr(5);
      try {
        text = atob(text.trim());
      } catch (error) {
        /* Nothing */
      }

      try {
        const data = parseElementData(text);
        const title = (data.find((x) => x.type === 'title') || { title: 'Unnamed Pack' }).title;
        const description = (data.find((x) => x.type === 'description') || { description: '(no pack description)' }).description;
        ShowDialog(
          `Add Pack ${title}?`,
          description,
          ['YES', 'NO']
        ).then((choice) => {
          if (choice === 0) {
            let id = Math.random().toString().substr(2);
            const data = parseElementData(text);
            const idMatch = list.find(x => x.type === 'id');
            if (idMatch) {
              id = idMatch.id;
            }
            registerElementData(data, id);
            exportedColorCache[id] = [];
            packSavefile.push([id, text]);
          }
        });
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
      }
    }
    location.hash = '#';
  }
  onPopState();
  window.addEventListener('popstate', onPopState);
});

// Manages parsing the element format.
const regexElementNoCombo = /^((?:[^!*{};()=:\\\-_]|\\.)+)\(((?:[^!*{};()=:\\\-_]|\\.)+)\) *(?:\[([^#"'!*{};()=:\-_]+|#[0-9A-Fa-f]{6}|{[^}]*}|https?:\/\/[^ \n\t]+)\])?$/;
const regexElement = /^((?:[^!*{};()=:\\\-_]|\\.)+|\((?:[^!*{};()=:\\\-_]|\\.)+\) *)\+([^{}()=+:_]+| *\((?:[^!*{};()=:\\\-_]|\\.)+\) *)=([^{}()=+:_]+)\(([^#"'!*{};()=:\-_]+)\) *(?:\[([^#"'!*{};()=:\-_]+|#[0-9A-Fa-f]{6}|{[^}]*}|https?:\/\/[^ \n\t]+)\])?$/;
const regexColor = /^([^#"'!*{};()=:\-_]+) *: *(#[0-9A-Fa-f]{6}|{[^}]*}|https?:\/\/[^ \n\t]+|null)$/;
const regexTitle = /^Title *= *(.+)$/;
const regexDescription = /^Description *= *(.+)$/;
const regexId = /^Id *= *([^ ]+)$/;
const regexImport = /^Import +([^ ]+)$/;
const regexImportNamespaced = /^Import +([^ ]+) +as + ([^ ]+) *$/;
const regexLoadBefore = /^LoadBefore *= *(.*)$/;
const regexVersion = /^Version *= *(.*)$/;
const regexLoadAfter = /^LoadAfter *= *(.*)$/;
const regexElemComment = /^((?:[^!*{};()=:\\\-_]|\\.)+) *- *(.*)$/;
const regexEscape = /\\(.)/g;
const regexColorColor = /^#[0-9A-Fa-f]{6}$/;
const regexColorImage = /^https?:\/\/[^ \n\t]+$/;
const regexColorCSS = /^{([^}]*)}$/;

function parseElementData(data, data_uid) {
  const definedThings = {
    id: false,
    title: false,
    description: false,
    loadBefore: false,
    loadAfter: false,
    version: false,
  };

  const colors = ['none'];

  function processColor(color) {
    if (color.startsWith('&')) {
      return `LOCAL@${data_uid}@${color.substring(1)}`;
    }
    if (color.startsWith('LOCAL@')) {
      throw new Error(`A category cannot start with "LOCAL@" (given ${color})`);
    }
    if (color.startsWith('INLINE@')) {
      throw new Error(`A category cannot start with "INLINE@" (given ${color})`);
    }
    return color;
  }

  function parseColorData(color) {
    const matchColorColor = color.match(regexColorColor);
    if (matchColorColor) {

      const rgb = parseInt(color.substring(1), 16);
      const r = rgb >> 16 & 0xff;
      const g = rgb >> 8 & 0xff;
      const b = rgb >> 0 & 0xff;
      // calculate color brightness
      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      return `background-color:${color};color:${brightness > 100 ? '#000' : '#fff'}`;
    }

    const matchColorImage = color.match(regexColorImage);
    if (matchColorImage) {
      return `background-image:url(${color})`;
    }

    const matchColorCSS = color.match(regexColorCSS);
    if (matchColorCSS) {
      return matchColorCSS[1];
    }
  }

  let extraEntries = [];

  const list = data
    // Split by newlines
    .split('\n')
    // Tabs to spaces
    .map((line) => line.replace(/\t+/g, ' '))
    // Remove double spaces
    .map((line) => line.replace(/  +/g, ' '))
    // Trim the whitespace off at the ends
    .map((line) => line.trim())
    // Process Each Line, there are three cases
    .map((line, index) => {
      // Remove Comments
      if (line.startsWith('#') || line.startsWith('//') || line === '') {
        return null;
      }

      // This + That = Element (Color)
      const matchElement = line.match(regexElement);
      if (matchElement) {
        const elem1 = matchElement[1].replace(regexEscape, '$1').trim();
        const elem2 = matchElement[2].replace(regexEscape, '$1').trim();
        const result = matchElement[3].replace(regexEscape, '$1').trim();
        const color = processColor(matchElement[4].replace(regexEscape, '$1').trim());
        let disguise = matchElement[5] && processColor(matchElement[5].replace(regexEscape, '$1').trim());

        if (!colors.includes(toInternalName(color))) { throw new Error('Cannot Find Color "' + color + '". Each Color must be defined separately in each pack.'); }

        if(disguise) {
          const disguiseCSS = parseColorData(disguise);

          if(disguiseCSS) {
            disguise = 'INLINE@' + result;
            colors.push(toInternalName('INLINE@' + result));
            extraEntries.push({ type: 'color', name: disguise, css: disguiseCSS });
          }
          if (!colors.includes(toInternalName(disguise))) { throw new Error('Cannot Find Color "' + disguise + '". Each Color must be defined separately in each pack.'); }
        }

        return { type: 'element', elem1, elem2, result, color, disguise };
      }

      // Element (Color)
      const matchElementNoCombo = line.match(regexElementNoCombo);
      if (matchElementNoCombo) {
        const result = matchElementNoCombo[1].replace(regexEscape, '$1').trim();
        const color = processColor(matchElementNoCombo[2].replace(regexEscape, '$1').trim());
        let disguise = matchElementNoCombo[3] && processColor(matchElementNoCombo[3].replace(regexEscape, '$1').trim());

        if (!colors.includes(toInternalName(color))) { throw new Error('Cannot Find Color "' + color + '". Each Color must be defined separately in each pack.'); }

        if (disguise) {
          const disguiseCSS = parseColorData(disguise);

          if (disguiseCSS) {
            disguise = 'INLINE@' + result;
            colors.push(toInternalName('INLINE@' + result));
            extraEntries.push({ type: 'color', name: disguise, css: disguiseCSS });
          }
          if (!colors.includes(toInternalName(disguise))) { throw new Error('Cannot Find Color "' + disguise + '". Each Color must be defined separately in each pack.'); }
        }
        return { type: 'element', result, color, disguise };
      }

      // Color: #112233
      const matchColor = line.match(regexColor);
      if (matchColor) {
        const name = processColor(matchColor[1].replace(regexEscape, '$1').trim());
        const color = matchColor[2].replace(regexEscape, '$1').trim();

        let css = parseColorData(color);

        colors.push(toInternalName(name));

        return { type: 'color', name, css };
      }

      const matchTitle = line.match(regexTitle);
      if (matchTitle) {
        if (definedThings.title) {
          throw new Error(`Duplicate Title Definition on line #${index + 1}.`);
        }
        definedThings.title = true;
        const title = matchTitle[1].replace(regexEscape, '$1').trim();

        return { type: 'title', title };
      }
      const matchId = line.match(regexId);
      if (matchId) {
        if (definedThings.id) {
          throw new Error(`Duplicate Id Definition on line #${index + 1}.`);
        }
        definedThings.id = true;
        const id = matchId[1].replace(regexEscape, '$1').trim();

        return { type: 'id', id };
      }
      const matchVersion = line.match(regexVersion);
      if (matchVersion) {
        if (definedThings.version) {
          throw new Error(`Duplicate Version Definition on line #${index + 1}.`);
        }
        definedThings.version = true;
        const version = matchVersion[1].replace(regexEscape, '$1').trim();

        return { type: 'version', version };
      }
      const matchImport = line.match(regexImport);
      if (matchImport) {
        const packID = matchImport[1].replace(regexEscape, '$1').trim();

        return { type: 'import', packID };
      }
      const matchLoadBefore = line.match(regexLoadBefore);
      if (matchLoadBefore) {
        if (definedThings.loadBefore) {
          throw new Error(`Duplicate LoadBefore Definition on line #${index + 1}.`);
        }
        definedThings.loadBefore = true;
        const listedIds = matchLoadBefore[1].replace(regexEscape, '$1').trim().split(',').map(x => x.trim());
        if (listedIds.includes('')) {
          throw new Error(`Blank ID not allowed in LoadBefore on line #${index + 1}.`);
        }

        return { type: 'loadBefore', listedIds };
      }
      const matchLoadAfter = line.match(regexLoadAfter);
      if (matchLoadAfter) {
        if (definedThings.loadAfter) {
          throw new Error(`Duplicate LoadBefore Definition on line #${index + 1}.`);
        }
        definedThings.loadAfter = true;
        const listedIds = matchLoadAfter[1].replace(regexEscape, '$1').trim().split(',').map(x => x.trim());
        if (listedIds.includes('')) {
          throw new Error(`Blank ID not allowed in LoadAfter on line #${index + 1}.`);
        }

        return { type: 'loadAfter', listedIds };
      }
      const matchDescription = line.match(regexDescription);
      if (matchDescription) {
        if(definedThings.description) {
          throw new Error(`Duplicate Description Definition on line #${index + 1}.`);
        }
        definedThings.description = true;
        const description = matchDescription[1].replace(regexEscape, '$1').trim();

        return { type: 'description', description };
      }

      const matchComment = line.match(regexElemComment);
      if (matchComment) {
        const elem = matchComment[1].replace(regexEscape, '$1').trim();
        const comment = matchComment[2].replace(regexEscape, '$1').trim();

        return { type: 'comment', comment, elem };
      }

      throw new Error(`Cannot parse line #${index + 1} "${line}"`);
    })
    .concat(extraEntries)
    // Remove Comments from array, aka null objects.
    .filter((x) => x !== null);

  return list;
}

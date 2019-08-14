// Manages parsing the element format.
const regexElementNoCombo = /^((?:[^!*{};()=:\\\-_]|\\.)+)\(((?:[^!*{};()=:\\\-_]|\\.)+)\)$/;
const regexElement = /^((?:[^!*{};()=:\\\-_]|\\.)+|\((?:[^!*{};()=:\\\-_]|\\.)+\) *)\+([^{}()=+:_]+| *\((?:[^!*{};()=:\\\-_]|\\.)+\) *)=([^{}()=+:_]+)\(([^"'!*{};()=:\-_]+)\)$/;
const regexColor = /^([^"'!*{};()=:\-_]+) *: *(#[0-9A-Fa-f]{6}|{[^}]*}|https?:\/\/[^ \n\t]+|null)$/;
const regexTitle = /^Title *= *(.*)$/;
const regexDescription = /^Description *= *(.*)$/;
const regexElemComment = /^((?:[^!*{};()=:\\\-_]|\\.)+) *- *(.*)$/;
const regexEscape = /\\(.)/g;
const regexColorColor = /^#[0-9A-Fa-f]{6}$/;
const regexColorImage = /^https?:\/\/[^ \n\t]+$/;
const regexColorCSS = /^{([^}]*)}$/;

function parseElementData(data) {
  const colors = ['none'];

  return data
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
        const color = matchElement[4].replace(regexEscape, '$1').trim();

        if (!colors.includes(toInternalName(color))) { throw new Error('Cannot Find Color "' + color + '". Each Color must be defined separately in each pack.'); }

        return { type: 'element', elem1, elem2, result, color };
      }

      // Element (Color)
      const matchElementNoCombo = line.match(regexElementNoCombo);
      if (matchElementNoCombo) {
        const result = matchElementNoCombo[1].replace(regexEscape, '$1').trim();
        const color = matchElementNoCombo[2].replace(regexEscape, '$1').trim();

        if (!colors.includes(toInternalName(color))) { throw new Error('Cannot Find Color "' + color + '". Each Color must be defined separately in each pack.'); }

        return { type: 'element', result, color };
      }

      // Color: #112233
      const matchColor = line.match(regexColor);
      if (matchColor) {
        const name = matchColor[1].replace(regexEscape, '$1').trim();
        const color = matchColor[2].replace(regexEscape, '$1').trim();

        let css = '';

        (function() {
          const matchColorColor = color.match(regexColorColor);
          if (matchColorColor) {

            const rgb = parseInt(color.substring(1), 16);
            const r = rgb >> 16 & 0xff;
            const g = rgb >> 8 & 0xff;
            const b = rgb >> 0 & 0xff;
            // calculate color brightness
            const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            css = `background-color:${color};color:${brightness > 100 ? '#000' : '#fff'}`;
            return;
          }

          const matchColorImage = color.match(regexColorImage);
          if (matchColorImage) {
            css = `background-image:url(${color})`;
            return;
          }

          const matchColorCSS = color.match(regexColorCSS);
          if (matchColorCSS) {
            css = matchColorCSS[1];
            return;
          }
        })();

        colors.push(toInternalName(name));

        return { type: 'color', name, css };
      }

      const matchTitle = line.match(regexTitle);
      if (matchTitle) {
        const title = matchTitle[1].replace(regexEscape, '$1').trim();

        return { type: 'title', title };
      }
      const matchDescription = line.match(regexDescription);
      if (matchDescription) {
        const description = matchDescription[1].replace(regexEscape, '$1').trim();

        return { type: 'description', description };
      }

      const matchComment = line.match(regexElemComment);
      if (matchComment) {
        const elem = matchComment[1].replace(regexEscape, '$1').trim();
        const comment = matchComment[2].replace(regexEscape, '$1').trim();

        return { type: 'comment', comment, elem };
      }

      throw Error(`Cannot parse line #${index + 1} "${line}"`);
    })
    // Remove Comments from array, aka null objects.
    .filter((x) => x !== null);
}

// Manages parsing the element format.
const regexElementNoCombo = /^([^{};(=+)]+)\(([^!*{};()=+:\-_]+)\)$/;
const regexElement = /^([^!*{};()=+:\-_]+|\([^!*{};()=+:\-_]+\) *)\+([^{}()=+:_]+| *\([^!*{};()=+:\-_]+\) *)=([^{}()=+:_]+)\(([^!*{};()=+:\-_]+)\)$/;
const regexColor = /^([^!*{};()=+:\-_]+) *: *(#[0-9A-Fa-f]{6})$/;
const regexTitle = /^Title *= *(.*)$/;
const regexDescription = /^Description *= *(.*)$/;
const regexElemComment = /^([^!*{};()=+:\-_]+) *- *(.*)$/;

function parseElementData(data) {
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
        const elem1 = matchElement[1].trim();
        const elem2 = matchElement[2].trim();
        const result = matchElement[3].trim();
        const color = matchElement[4].trim();

        return { type: 'element', elem1, elem2, result, color };
      }

      // Element (Color)
      const matchElementNoCombo = line.match(regexElementNoCombo);
      if (matchElementNoCombo) {
        const result = matchElementNoCombo[1].trim();
        const color = matchElementNoCombo[2].trim();

        return { type: 'element', result, color };
      }

      // Color: #112233
      const matchColor = line.match(regexColor);
      if (matchColor) {
        const name = matchColor[1].trim();
        const color = matchColor[2].trim();

        return { type: 'color', name, color };
      }

      const matchTitle = line.match(regexTitle);
      if (matchTitle) {
        const title = matchTitle[1].trim();

        return { type: 'title', title };
      }
      const matchDescription = line.match(regexDescription);
      if (matchDescription) {
        const description = matchDescription[1].trim();

        return { type: 'description', description };
      }

      const matchComment = line.match(regexElemComment);
      if (matchComment) {
        const elem = matchComment[1].trim();
        const comment = matchComment[2].trim();

        return { type: 'comment', comment, elem };
      }

      throw Error(`Cannot parse line #${index + 1} "${line}"`);
    })
    // Remove Comments from array, aka null objects.
    .filter((x) => x !== null);
}

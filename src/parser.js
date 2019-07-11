// Manages parsing the element format.
const regexElementNoCombo = /^([^(=+)]+)\(([^()=+:_]+)\)$/
const regexElement = /^([^()=+:_]+)\+([^()=+:_]+)=([^()=+:_]+)\(([^()=+:_]+)\)$/
const regexColor = /^([^()=+:_]+): *(#[0-9A-Fa-f]{6})$/;

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
    // Remove Comments
    .filter((line) => !(line.startsWith('#') || line.startsWith('//') || line === ''))
    // Process Each Line, there are three cases
    .map((line) => {
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

      throw Error('Cannot parse line "' + line + '"');
    });
}

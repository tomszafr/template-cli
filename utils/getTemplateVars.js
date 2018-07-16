import arrayUniq from 'array-uniq';

export default function getTemplateVars(template) {
  if (typeof template !== 'string') {
    throw new TypeError('Expected template to be a string');
  }

  const pattern = [
    '<%[=|-]?', // look for opening tag (<%, <%=, or <%-)
    '(?:[\\s]|if|\\()*', // accept any space after opening tag and before identifier
    '(.+?)', // capture the identifier name (`hello` in <%= hello %>)
    '(?:[\\s]|\\)|\\{)*', // accept any space after identifier and before closing tag
    '%>', // look for closing tag
  ].join('');

  const regex = new RegExp(pattern, 'g');

  const matches = [];

  let match;
  // eslint-disable-next-line
  while (match = regex.exec(template)) {
    matches.push(match[1]);
  }

  return arrayUniq(matches);
}

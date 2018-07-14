'use strict'

const fs = require('fs');
const util = require('util');
const path = require('path');
const prompt = require('prompt');
const _ = require('lodash');
var shell = require('shelljs');

prompt.colors = false;

const paths = require('../paths');
const getTemplateVars = require('../getTemplateVars');

const readFile = util.promisify(fs.readFile);
const promptGet = util.promisify(prompt.get);
const writeFile = util.promisify(fs.writeFile);

const getFile = async (templateName) => {
  return await readFile(path.resolve(paths.templatesDir, `${templateName}.template`), 'utf8')
}

function reverseString(string) {
  return string.split('').reverse().join('');
}

function injectNameIntoString(name, string) {
  const template = _.template(string);
  return template({ name });
}

function insertBefore(name, regexp, string, ignoreWhitespace = false) {
  const stringWithName = injectNameIntoString(name, string);
  return (workingData) => {
    const searchPosition = workingData.search(regexp);
    if (!searchPosition || searchPosition < 0) {
      return workingData;
    }
    let searchWhitespace = '';
    if (!ignoreWhitespace) {
      const beforeSearchReverse = reverseString(workingData.substring(0, searchPosition));
      searchWhitespace = '\n' + beforeSearchReverse.match(/.+?(?=\n)/)[0];
    }
    return workingData.substring(0, searchPosition) + stringWithName + searchWhitespace + workingData.substring(searchPosition);
  }
}

function insertAfter(name, regexp, string) {
  const stringWithName = injectNameIntoString(name, string);
  return (workingData) => {
    const searchPosition = workingData.match(regexp);
    if (!searchPosition) {
      return workingData;
    }
    const startPosition = searchPosition.index + searchPosition[0].length;
    const beforeSearchReverse = reverseString(workingData.substring(0, searchPosition.index));
    const searchWhitespace = beforeSearchReverse.match(/.+?(?=\n)/) || [''];
    return workingData.substring(0, startPosition) + '\n' + searchWhitespace[0] + stringWithName + workingData.substring(startPosition);
  }
}

function append(name, string) {
  const stringWithName = injectNameIntoString(name, string);
  return (workingData) => {
    return workingData + stringWithName;
  }
}

module.exports = async (taskSpec, name) => {
  if (!taskSpec.flow) {
    return console.error('Must specify the edit flow');
  }
  const editFlow = taskSpec.flow.map(([methodIdentifier, ...params]) => {
    switch (methodIdentifier) {
      case 'insertBefore':
        return insertBefore(name, ...params);
      case 'insertAfter':
        return insertAfter(name, ...params);
      case 'append':
        return append(name, ...params);
      default:
        console.error(`Unrecognized method ${methodIdentifier}`);
        return null;
    }
  }).filter(value => value !== null);

  const pipeline = _.flow(editFlow);

  const file = await readFile(taskSpec.target, 'utf8')

  const result = pipeline(file);

  await writeFile(taskSpec.target, result);
}
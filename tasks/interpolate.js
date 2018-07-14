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

const getTemplate = async (templateName) => {
  return await readFile(path.resolve(paths.templatesDir, `${templateName}.template`), 'utf8')
}

module.exports = async (taskSpec, name) => {
  if (!taskSpec.template) {
    return console.error('Must specify a template file');
  }
  console.log('name: ', name);
  const template = await getTemplate(taskSpec.template);
  let templateVariables = getTemplateVars(template);
  let variableValues = {};
  if (name && name.length > 0) {
    templateVariables = templateVariables.filter(value => value !== 'name');
    variableValues = {
      name,
    };
  }
  if (templateVariables.length > 0) {
    console.log(`Provide additional variables for template: ${taskSpec.template}`);
    prompt.start();
    const userValues = await promptGet(templateVariables)
    variableValues = {
      ...variableValues,
      ...userValues
    };
  }
  const templateFunction = _.template(template);
  const outputDir = path.dirname(taskSpec.target)

  shell.mkdir('-p', outputDir);

  const outputFilePath = taskSpec.target.replace('[name]', name);
  const interpolationResult = templateFunction(variableValues);

  await writeFile(outputFilePath, interpolationResult)
}
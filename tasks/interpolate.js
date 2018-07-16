
import shell from 'shelljs';
import util from 'util';
import path from 'path';
import prompt from 'prompt';
import _ from 'lodash';
import chalk from 'chalk';

import { getTemplateVars, getTemplate, writeFile } from '../utils';

import { InnerTaskError } from '../infrastructure/exceptions';

prompt.colors = false;

const promptGet = util.promisify(prompt.get);

export default async (taskSpec, name) => {
  if (!taskSpec.template) {
    throw new InnerTaskError('Must specify a template file');
  }
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
    chalk.magenta(`Provide additional variables for template: ${taskSpec.template}`);
    prompt.start();
    const userValues = await promptGet(templateVariables);
    variableValues = {
      ...variableValues,
      ...userValues,
    };
  }
  const templateFunction = _.template(template);
  const outputDir = path.dirname(taskSpec.target);

  shell.mkdir('-p', outputDir);

  const outputFilePath = taskSpec.target.replace('[name]', name);
  const interpolationResult = templateFunction(variableValues);

  await writeFile(outputFilePath, interpolationResult);
};

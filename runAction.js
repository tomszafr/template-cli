'use strict'
const path = require('path');
const taskDir = `${__dirname}/tasks`;

module.exports = async (name, actionName, actionPath) => {
  let actionSpec;
  try {
    actionSpec = require(actionPath);
  } catch {
    return console.error('Error loading action spec')
  }
  if (!actionSpec.flow) {
    return console.error('Action flow not defined')
  }
  actionSpec.flow.forEach(taskSpec => {
    const taskName = taskSpec.task;
    try {
      const taskRunnerPath = path.resolve(taskDir, `${taskName}.js`)
      const taskRunner = require(taskRunnerPath);
      taskRunner(taskSpec, name);
    } catch (err) {
      console.error(err);
    }
  });
}
const util = require('util');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const _ = require('lodash');
const getTemplateVars = require('./getTemplateVars');
const runAction = require('./runAction');

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const paths = require('./paths');

async function main() {
  const getActionFiles = async () => {
    return await readDir(paths.actionsDir);
  }
  try {
    const actions = await getActionFiles();
    actions.forEach((action) => {
      const actionPath = path.resolve(paths.actionsDir, action);
      const actionName = path.basename(action, '.json');
      program
        .command(`${actionName} [name]`)
        .action((name) => {
          runAction(name, actionName, actionPath);
        });
    })
  } catch (err) {
    console.error(err);
  }

  program
    .version('0.0.1')
    .parse(process.argv);
}

main();
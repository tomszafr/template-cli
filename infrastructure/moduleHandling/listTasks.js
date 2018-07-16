import path from 'path';
import chalk from 'chalk';

import { getTaskFiles } from '../../utils/fileAccess';

const { log } = console;

export default async function listTasks() {
  const actions = await getTaskFiles();
  log(chalk.magenta('  Loaded tasks:'));
  actions.forEach((action) => {
    const taskName = path.basename(action, '.js');
    log(chalk.magenta(`    - ${taskName}`));
  });
}

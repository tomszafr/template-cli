import program from 'commander';
import childProcess from 'child_process';
import chalk from 'chalk';
import registerActions from './moduleHandling/registerActions';
import handleException from './handleException';
import packageJson from '../package.json';
import paths from '../paths';
import listTasks from './moduleHandling/listTasks';

const { log } = console;

export default async function main() {
  try {
    await registerActions(program);
    program
      .version(packageJson.version)
      .command('open-dir', '', {
        noHelp: true,
      })
      .action(() => {
        childProcess.exec(`start "" "${paths.srcDir}"`);
      });

    program
      .command('list-tasks', '', {
        noHelp: true,
      })
      .action(() => {
        listTasks();
      });
    chalk.red('Test');
    program.on('--help', () => {
      log(chalk.magenta(''));
      log(chalk.magenta('  Non-action commands:'));
      log(chalk.magenta(''));
      log(chalk.magenta('    open-dir                   open main template-cli in windows explorer'));
      log(chalk.magenta('    list-tasks                 output list of available tasks'));
      log(chalk.magenta(''));
    });

    program.parse(process.argv);
  } catch (err) {
    handleException(err);
  }
}

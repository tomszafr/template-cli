import chalk from 'chalk';
import prompt from 'prompt';
import _ from 'lodash';
import editer from 'editer';
import { InnerTaskError, FileOperationError } from '../infrastructure/exceptions';
import { readFile, writeFile } from '../utils';

prompt.colors = false;


const parseAllRegex = (options) => {
  if (options.after && options.after.regex) {
    return {
      ...options,
      after: {
        ...options.after,
        regex: new RegExp(options.after.regex, 'g'),
      },
    };
  }
  if (options.before && options.before.regex) {
    return {
      ...options,
      before: {
        ...options.before,
        regex: new RegExp(options.before.regex, 'g'),
      },
    };
  }
  if (options.or) {
    return {
      or: options.or.map(nestedOptions => parseAllRegex(nestedOptions)),
    };
  }
  return options;
};

function injectNameIntoString(name, string) {
  const template = _.template(string);
  return template({ name });
}

export default async function textEdit(taskSpec, name) {
  if (!taskSpec.flow) {
    throw new InnerTaskError('Must specify the edit flow');
  }
  const editFlow = taskSpec.flow
    .filter(([methodIdentifier]) => {
      const methodExists = !!editer[methodIdentifier];
      if (!methodExists) {
        console.log(chalk.yellow(`[Warning]: Unrecognized method ${methodIdentifier}`));
      }
      return methodExists;
    })
    .map(([methodIdentifier, string, options]) => {
      const parsedOptions = parseAllRegex(options);
      const stringWithName = injectNameIntoString(name, string);
      return (target) => {
        try {
          return editer[methodIdentifier](stringWithName, target, parsedOptions);
        } catch (err) {
          console.log(chalk.yellow(`[Warning]: Couldn't ${methodIdentifier} '${string}' using ${JSON.stringify(parsedOptions)}`));
          return target;
        }
      };
    });

  const pipeline = _.flow(editFlow);

  try {
    const file = await readFile(taskSpec.target, 'utf8');

    const result = pipeline(file);

    await writeFile(taskSpec.target, result);
  } catch (err) {
    throw new FileOperationError(err);
  }
}

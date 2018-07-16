import path from 'path';

import paths from '../../paths';
import { getActionFiles } from '../../utils/fileAccess';
import runAction from '../runAction';
import handleException from '../handleException';

export default async function registerActions(program) {
  const actions = await getActionFiles();
  actions.forEach((action) => {
    const actionPath = path.resolve(paths.actionsDir, action);
    const actionName = path.basename(action, '.json');
    program
      .command(`${actionName} [name]`)
      .action((name) => {
        try {
          runAction(name, actionName, actionPath);
        } catch (err) {
          handleException(err);
        }
      });
  });
}

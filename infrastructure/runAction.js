import path from 'path';
import paths from '../paths';

import { ModuleLoadingError, UndefinedActionFlowError, TaskExecutionError } from './exceptions';

export default async function runAction(name, actionName, actionPath) {
  let actionSpec;
  try {
    // eslint-disable-next-line
    actionSpec = require(actionPath);
  } catch (err) {
    throw new ModuleLoadingError('Could not load action specification');
  }
  if (!actionSpec.flow) {
    throw new UndefinedActionFlowError(`Action flow for ${actionName} not defined`);
  }
  actionSpec.flow.forEach(async (taskSpec) => {
    const taskName = taskSpec.task;
    let taskRunner;
    try {
      const taskRunnerPath = path.resolve(paths.tasksDir, `${taskName}.js`);
      // eslint-disable-next-line
      taskRunner = require(taskRunnerPath).default;
    } catch (err) {
      throw new ModuleLoadingError(`Could not load a task runner for task ${taskName}`);
    }
    try {
      await taskRunner(taskSpec, name);
    } catch (err) {
      throw new TaskExecutionError(err);
    }
  });
}

import path from 'path';
import fs from 'fs';
import util from 'util';
import paths from '../paths';

export const readDir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);
export const writeFile = util.promisify(fs.writeFile);

export async function getActionFiles() {
  return readDir(paths.actionsDir);
}

export async function getTaskFiles() {
  return readDir(paths.tasksDir);
}

export async function getTemplate(templateName) {
  return readFile(path.resolve(paths.templatesDir, `${templateName}.template`), 'utf8');
}

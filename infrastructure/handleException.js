import chalk from 'chalk';
import _ from 'lodash';
import * as exceptions from './exceptions';

const knownExceptions = _.values(exceptions);

/* eslint-disable no-console */
export default function handleException(error) {
  if (knownExceptions.any(ex => ex.name === error.name)) {
    console.log(chalk.red(`[${error.name}]: ${error.message}`));
  } else {
    console.log(chalk.red(`[Unknown error]: ${error}`));
  }
}

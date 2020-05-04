import * as fs from 'fs'
import * as readline from 'readline'
import { ValidatorResult, VariableType, FailReason } from './validator.types'
import validateVar from './methods/validateVar';
import logger from './methods/logger';

export default (location: string, options: {
  silent: boolean
} = {
  silent: false
}): Promise<ValidatorResult> => {
  let res: ValidatorResult;

  return new Promise((resolve, reject) => {
    const readInterface = readline.createInterface({
      input: fs.createReadStream(location).on('error', () => {
        return reject(new Error(`Couldn't open file at ${location}. Please ensure you're passing the right path to your env template.`))
      }),
    })

    readInterface.on('line', (line = '') => {
      const lineWithoutComments = line.replace(/\#(.*)/g, '').trim()
      if (lineWithoutComments === '') return

      const name = lineWithoutComments.split('=')[0].trim()
      const expectedType = line.split('=')[1]
        .toUpperCase()
        .replace('?', '')
      const optional = (line.substr(-1) === '?')
      const actualValue = process.env[name]

      if (!Object.values(VariableType).includes(expectedType as any)) {
        return reject(new Error(`Var ${name} has unknown expected type ${expectedType}. Valid types: string, number, array`))
      }

      const result = validateVar(expectedType as VariableType, actualValue, optional)

      if (!result.pass) {
        res = {
          result: 'fail',
          failedVar: result.failReason === FailReason.MISSING
            ? {
              reason: FailReason.MISSING,
              name,
              expectedType: expectedType as VariableType,
              valid: false
            } : {
              reason: FailReason.WRONG_TYPE,
              name,
              expectedType: expectedType as VariableType,
              valid: false
            },
        } as ValidatorResult

        readInterface.close()
      }
    }).on('close', () => {
      if (!res) res = {
        result: 'pass'
      } as ValidatorResult

      if (!options.silent) logger(res)

      return resolve(res)
    })
  })
}

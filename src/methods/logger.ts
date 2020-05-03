import { ValidatorResult } from '../validator.types'

const log = (string: string, warn: boolean = true) => {
  console[warn ? 'warn' : 'log'](`[VALIDATE_ENV] ${string}`)
}

export default (result: ValidatorResult) => {
  if (result.result === 'fail') {
    const { failedVar } = result

    const {
      name,
      expectedType
    } = failedVar

    if (failedVar.reason === 'MISSING') {
      log(`Variable ${name} is missing in .env. Expected type: ${expectedType}`)
    }

    if (failedVar.reason === 'WRONG_TYPE') {
      log(`Variable ${name} isn't of expected type ${expectedType}.`)
    }
  } else if (result.result === 'pass') {
    log('.env is valid 🎉', false)
  }
}

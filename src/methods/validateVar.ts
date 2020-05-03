import { VariableType, FailReason } from '../validator.types'

const isNumeric = (input: string) => {
  return !isNaN(input as any)
}

const isArrayish = (input: string) => {
  let parsed: { array: any }
  
  try {
    const testString = `{ "array": ${input} }`
    parsed = JSON.parse(testString)
  } catch (e) {
    console.error(e)
    return false
  }

  console.log(parsed)

  if (!Array.isArray(parsed.array)) {
    return false
  }

  return true
}

const runTest = (testForType: VariableType, input: string) => {
  switch (testForType) {
    case VariableType.ARRAY:
      return isArrayish(input)
    case VariableType.NUMBER:
      return isNumeric(input)
    case VariableType.STRING:
      return true
    case VariableType.BOOLEAN:
      return /true/.test(input) || /false/.test(input)
  }
}

export default (expectedType: VariableType, actualValue: any): {
  pass: true
} | {
  pass: false
  failReason: FailReason.MISSING
} | {
  pass: false
  failReason: FailReason.WRONG_TYPE
} => {
  if (!(actualValue && actualValue !== '')) {
    return {
      pass: false,
      failReason: FailReason.MISSING
    }
  }

  const typeCheck = runTest(expectedType, actualValue)
  if (!typeCheck) {
    return {
      pass: false,
      failReason: FailReason.WRONG_TYPE
    }
  }

  return { pass: true }
}

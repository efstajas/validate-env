export interface SuccessPayload {
  result: 'pass'
}

export interface FailedPayload {
  result: 'fail'
  failedVar: InvalidVariable
}

export type ValidatorResult = SuccessPayload | FailedPayload

export interface ValidVarable {
  valid: true
  name: string
  type: VariableType
  value: string | any[] | number
}

export enum VariableType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN'
}

export enum FailReason {
  WRONG_TYPE = 'WRONG_TYPE',
  MISSING = 'MISSING'
}

export type InvalidVariable = WrongTypeVariable | MissingVariable

export interface WrongTypeVariable {
  valid: false
  reason: FailReason.WRONG_TYPE
  name: string
  expectedType: VariableType
}

export interface MissingVariable {
  valid: false
  reason: FailReason.MISSING
  name: string
  expectedType: VariableType
}
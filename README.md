# 🚓 validate-env

![Node.js 10.x and 12.x CI](https://github.com/efstajas/validate-env/workflows/Node.js%2010.x%20and%2012.x%20CI/badge.svg)

A small utility for checking process.env based on a .env.template file in node.js. You can use it to make sure all your env variables are set before running your application, and optionally ensure they're of the right types too.

## ⬇️ Install

Simply install with npm or yarn. validate-env is available on the NPM registry and on GitHub Packages.

```
npm install @efstajas/validate-env

or

yarn add @efstajas/validate-env
```

## 🎬 Getting started

First, create your `.env.template` file. This file contains all the .env variables you want to validate for. While you should never commit a .env file, committing the .env.template makes a lot of sense — everyone working on your project can see immediately what values they need, and validation will work as expected on any client. An example `.env.template` might look something like this:

```
FOO=string
BAR=number
FOOBAR=array
FOOBARFOO=boolean
```

This `.env.template` means you expect all the variables FOO, BAR, FOOBAR and FOOBARFOO to exist. As you can see, after the =, you can specify a type for that given variable:

- `number` means your variable must be numeric, meaning it can be something like `1` or `004` or even `6e+2`.
- `array` means your variable must be a valid JSON array, like `["foo", 123]`. Please note it must be **valid JSON**, meaning strings are to be double-quoted.
- `boolean` means your variable must be either `'true'` or `'false'` 
- `string` means your variable must be a valid string. In practice, *any value will pass this test*, because .env variables are always strings.

### Usage

To run the test, simply import the main function, and pass it your `.env.template` file path. It returns a Promise that will resolve to a `ValidatorResult`. 

```ts
import validateEnv from '@efstajas/validate-env'

validateEnv('./path/to/your/.env.template').then((r) => {
  if (r.result === 'pass') {
    //... your result is valid!
  }

  if (r.result === 'fail') {
    /*
    Something is wrong in your .env
    */
  }
}).catch((e) => {
  /*
  Something went wrong while validating —
  maybe we couldn't open the file, or the
  template itself is invalid.
  */
  console.error(e)
})
```

The `ValidatorResult` contains either a `SuccessPayload` like `{ result: 'pass' }`, or a `FailedPayload` which includes more info about what exactly failed:

```ts
validateEnv('./path/to/your/.env.template').then((r) => {
  if (r.result === 'fail') {
    const { failedVar } = r

    const {
      name,
      expectedType
    } = failedVar

    if (failedVar.reason === 'MISSING') {
      // The variable is missing.
    }

    if (failedVar.reason === 'WRONG_TYPE') {
      // The variable is of a wrong type.
    }
  }
})
```

### Normal usage: Validating .env before starting your app

Usually, you would want to validate your `.env` at the very beginning of your app, and if it fails, don't even initialize it. The best way to achieve this is to just wrap your initialization routine into a function, and then call it only if the `validateEnv` result indicates that your `.env` is valid. Probably, you're going to want to print some error messages into the console in case of a failure, so that other contributers know what's going on and your app doesn't just silently exit in case of an invalid `.env`. For an express application, it could look something like this:

```ts
// Use dotenv to load .env file into process.env
import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import validateEnv from '@efstajas/validate-env'

const initializeApplication = () => {
  const server = express.server

  // Register routes, middleware etc.

  server.listen(8000)
}

validateEnv('./.env.template').then((r) => {
  if (r.result === 'pass') {
    initializeApplication()
  }
}).catch((e) => {
  /*
  Something went wrong while validating —
  maybe we couldn't open the file, or the
  template itself is invalid.
  */
  console.error(e)
})
```

### Silent mode

By default, `validate-env` prints warnings or a success message to the console automatically after validation. If you want to handle logs by yourself, you can disable this behavior by passing the `silent` option:

```ts
validateEnv('./.env.template', { silent: true }).then((r) => {
  if (r.result === 'fail') {
    const { failedVar } = r

    const {
      name,
      expectedType
    } = failedVar

    if (failedVar.reason === 'MISSING') {
      console.log(`Variable ${name} is missing in .env. Expected type: ${expectedType}`)
    }

    if (failedVar.reason === 'WRONG_TYPE') {
      console.log(`Variable ${name} isn't of expected type ${expectedType}.`)
    }
  } else if (r.result === 'pass') {
    console.log('.env is valid 🎉')

    initializeApplication()
  }
})
```

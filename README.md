## fallible
A type-safe propagating error handling solution for TypeScript.

### Installation
No NPM package for now, so you need to add this repository directly as a dependency:
```
$ yarn add https://github.com/gregor-smith/fallible.git
```

### Usage

Where you would previously `throw`, instead return a `Result<Ok, Error>` using the `ok` and `error` helpers:
```typescript
type FetchJSONError =
    | { tag: 'NetworkError' }
    | { tag: 'StatusError', status: number }
    | { tag: 'ParseJSONError' }

async function fetchJSON(url: string): Promise<Result<unknown, FetchJSONError>> {
    let response: Response
    try {
        response = await fetch(url)
    }
    catch {
        return error({ tag: 'NetworkError' })
    }
    if (!response.ok) {
        return error({ tag: 'StatusError', status: response.status })
    }
    let body: unknown
    try  {
        body = await response.json()
    }
    catch {
        return error({ tag: 'ParseJSONError' })
    }
    return ok(body)
}
```

Then when working with a `Result` value, use `fallible` or `asyncFallible` to `propagate` its error side, if one is present:

```typescript
type ValidateJSONError = { tag: 'InvalidJSON', details: string }

function fetchAndValidateJSON<T>(
    url: string,
    validate: (value: unknown) => Result<T, ValidateJSONError>
) {
    return asyncFallible<T, FetchJSONError | ValidateJSONError>(async propagate => {
        // If fetchJSON returns an Error<T>, execution stops here and the error
        // is immediately returned. If it returns an Ok<T>, its value is
        // unwrapped and execution continues.
        const body = propagate(await fetchJSON(url))
        // fallible/asyncFallible return a Result
        return validate(body)
    })
}
```

The compiler ensures only `Result`s with the appropriate error channel can be propagated:
```typescript
declare const hasNumberError: Result<unknown, number>
declare const hasBooleanError: Result<unknown, boolean>
declare const hasStringError: Result<unknown, string>

fallible<number, string>(propagate => {
    propagate(hasNumberError)  // compile error
    propagate(hasBooleanError)  // compile error
    propagate(hasStringError)  // propagates if value is Error<string>
    return ok(123)
})
```

### Convenience functions
The `mapError` higher order function transforms the error channel of a `Result` from one type to another. It is best used when [piping](https://github.com/gregor-smith/piper) a `Result` into the `propagate` function.

```typescript
type ExampleError = { message: string }

declare function getExampleResult(): Result<number, ExampleError>

fallible<number, string>(propagate => {
    const x = pipe(
        getExampleResult(),
        mapError(error => error.message),
        propagate
    )
    return ok(x + 1)
})
```

`tapError` can be used to inspect the error value of a `Result` without modifying it.

```typescript
declare const getExampleResult(): Result<void, string>

fallible<number, string>(propagate => {
    pipe(
        getExampleResult(),
        tapError(error => console.log(`Error being propagated: ${error}`))
        propagate
    )
    return ok(123)
})
```

A number of higher order functions are provided that ease working with throwing functions by wrapping them to return `Result`s instead. All of these functions also have equivalents for `async` functions:

```typescript
class ExampleError {}
declare function throwsExampleError(_: string): string
declare function throwsStrings(_: boolean): boolean
declare function throwsUnknown(_: number): number

// Thrown values of the given type are caught and returned in a Result.
// Everything else still throws.
const a: (_: string) => Result<string, ExampleError> = wrapExceptionByType(
    throwsExampleError,
    ExampleError
)

// Thrown values passing the given guard function are returned in a Result.
// Everything else still throws. Useful when you know the shape of errors that
// can be thrown, but the type is not exposed or is too broad.
const b: (_: boolean) => Result<boolean, string> = wrapGuardedException(
    throwsStrings,
    (thrown): thrown is string => typeof thrown === 'string'
)

// All thrown values are caught and returned in a Result. Useful if you have
// no idea what a function can throw, only that it can (an unfortunately common
// occurrence with JavaScript).
const c: (_: number) => Result<number, unknown> = wrapAnyException(throwsUnknown)
```

There are also functions to wrap expressions that can potentially throw:

```typescript
const a: Result<string, ExampleError> = catchExceptionByType(
    () => throwsExampleError('abc'),
    ExampleError
)

const b: Result<boolean, string> = catchGuardedException(
    () => throwsStrings(true),
    (thrown): thrown is string => typeof thrown === 'string'
)

const c: Result<number, unknown> = catchAnyException(() => throwsUnknown(123))
```

Naturally these functions have `async` equivalents too.

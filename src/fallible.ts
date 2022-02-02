class FallibleError<T> {
    public constructor(
        public readonly value: T
    ) {}
}


export type Ok<T> = { ok: true, value: T }
export type Error<T> = { ok: false, value: T }
export type Result<TOk, TError> = Ok<TOk> | Error<TError>


function propagate<TOk, TError>(result: Result<TOk, TError>): TOk {
    if (!result.ok) {
        throw new FallibleError(result.value)
    }
    return result.value
}


export function fallible<TOk, TError>(
    func: (
        propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn
    ) => Result<TOk, TError>
): Result<TOk, TError> {
    try {
        return func(propagate)
    }
    catch (exception: unknown) {
        if (exception instanceof FallibleError) {
            return error(exception.value)
        }
        throw exception
    }
}


export type Awaitable<T> = T | PromiseLike<T>


export async function asyncFallible<TOk, TError>(
    func: (
        propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn
    ) => Awaitable<Result<TOk, TError>>
): Promise<Result<TOk, TError>> {
    try {
        return await func(propagate)
    }
    catch (exception: unknown) {
        if (exception instanceof FallibleError) {
            return error(exception.value)
        }
        throw exception
    }
}


export function ok<T extends void>(): Ok<T>
export function ok<T>(value: T): Ok<T>
export function ok(value?: any) {
    return { ok: true, value }
}


export function error<T extends void>(): Error<T>
export function error<T>(value: T): Error<T>
export function error(value?: any) {
    return { ok: false, value }
}


export function mapError<TOk, TError, TNewError>(
    func: (error: TError) => TNewError
): (result: Result<TOk, TError>) => Result<TOk, TNewError> {
    return result => result.ok
        ? result
        : error(func(result.value))
}


export function tapError<TOk, TError>(
    func: (error: TError) => void
): (result: Result<TOk, TError>) => Result<TOk, TError> {
    return mapError(error => {
        func(error)
        return error
    })
}


function guardOrThrow<T>(
    exception: unknown,
    guard: (exception: unknown) => exception is T
): Error<T> {
    if (!guard(exception)) {
        throw exception
    }
    return error(exception)
}


export function catchAnyException<TOk>(
    func: () => TOk
): Result<TOk, unknown> {
    try {
        return ok(func())
    }
    catch (exception: unknown) {
        return error(exception)
    }
}


export function catchGuardedException<TOk, TError>(
    func: () => TOk,
    exceptionGuard: (exception: unknown) => exception is TError
): Result<TOk, TError> {
    try {
        return ok(func())
    }
    catch (exception: unknown) {
        return guardOrThrow(exception, exceptionGuard)
    }
}


function instanceOfGuard<T>(type: new (...args: any[]) => T): (value: unknown) => value is T {
    return (value): value is T => value instanceof type
}


export function catchExceptionByType<TOk, TError>(
    func: () => TOk,
    exceptionType: new (...args: any[]) => TError
): Result<TOk, TError> {
    return catchGuardedException(
        func,
        instanceOfGuard(exceptionType)
    )
}


export async function asyncCatchAnyException<TOk>(
    func: () => Awaitable<TOk>
): Promise<Result<TOk, unknown>> {
    try {
        return ok(await func())
    }
    catch (exception: unknown) {
        return error(exception)
    }
}


export async function asyncCatchGuardedException<TOk, TError>(
    func: () => Awaitable<TOk>,
    exceptionGuard: (exception: unknown) => exception is TError
): Promise<Result<TOk, TError>> {
    try {
        return ok(await func())
    }
    catch (exception: unknown) {
        return guardOrThrow(exception, exceptionGuard)
    }
}


export function asyncCatchExceptionByType<TOk, TError>(
    func: () => Awaitable<TOk>,
    exceptionType: new (...args: any[]) => TError
): Promise<Result<TOk, TError>> {
    return asyncCatchGuardedException(
        func,
        instanceOfGuard(exceptionType)
    )
}


export function wrapAnyException<TArgs extends any[], TReturn>(
    func: (...args: TArgs) => TReturn
): (...args: TArgs) => Result<TReturn, unknown> {
    return (...args) => catchAnyException(() => func(...args))
}


export function wrapGuardedException<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => TReturn,
    exceptionGuard: (exception: unknown) => exception is TError
): (...args: TArgs) => Result<TReturn, TError> {
    return (...args) => catchGuardedException(() => func(...args), exceptionGuard)
}


export function wrapExceptionByType<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => TReturn,
    exceptionType: new (...args: any[]) => TError
): (...args: TArgs) => Result<TReturn, TError> {
    return (...args) => catchExceptionByType(() => func(...args), exceptionType)
}


export function asyncWrapAnyException<TArgs extends any[], TReturn>(
    func: (...args: TArgs) => Awaitable<TReturn>
): (...args: TArgs) => Promise<Result<TReturn, unknown>> {
    return (...args) => asyncCatchAnyException(() => func(...args))
}


export function asyncWrapGuardedException<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => Awaitable<TReturn>,
    exceptionGuard: (exception: unknown) => exception is TError
): (...args: TArgs) => Promise<Result<TReturn, TError>> {
    return (...args) => asyncCatchGuardedException(() => func(...args), exceptionGuard)
}


export function asyncWrapExceptionByType<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => Awaitable<TReturn>,
    exceptionType: new (...args: any[]) => TError
): (...args: TArgs) => Promise<Result<TReturn, TError>> {
    return (...args) => asyncCatchExceptionByType(() => func(...args), exceptionType)
}

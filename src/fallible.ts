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


function dummyGuard(_value: unknown): _value is unknown {
    return true
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


export function wrapException<TOk>(
    func: () => TOk
): Result<TOk, unknown>
export function wrapException<TOk, TError>(
    func: () => TOk,
    exceptionGuard: (exception: unknown) => exception is TError
): Result<TOk, TError>
export function wrapException(
    func: () => any,
    exceptionGuard = dummyGuard
) {
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


export function wrapExceptionByType<TOk, TError>(
    func: () => TOk,
    exceptionType: new (...args: any[]) => TError
): Result<TOk, TError> {
    return wrapException(
        func,
        instanceOfGuard(exceptionType)
    )
}


export function asyncWrapException<TOk>(
    func: () => Awaitable<TOk>
): Promise<Result<TOk, unknown>>
export function asyncWrapException<TOk, TError>(
    func: () => Awaitable<TOk>,
    exceptionGuard: (exception: unknown) => exception is TError
): Promise<Result<TOk, TError>>
export async function asyncWrapException(
    func: () => any,
    exceptionGuard = dummyGuard
) {
    try {
        return ok(await func())
    }
    catch (exception: unknown) {
        return guardOrThrow(exception, exceptionGuard)
    }
}


export function asyncWrapExceptionByType<TOk, TError>(
    func: () => Awaitable<TOk>,
    exceptionType: new (...args: any[]) => TError
): Promise<Result<TOk, TError>> {
    return asyncWrapException(
        func,
        instanceOfGuard(exceptionType)
    )
}

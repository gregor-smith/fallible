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


/**
 * Takes a function with a single function argument; when this `propagate`
 * argument is passed a {@link Result}, the {@link Error} channel if present is
 * immediately propagated and returned, otherwise the value of the {@link Ok}
 * channel is returned and execution continues.
 */
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


/** Any value that produces `T` when `await`ed */
export type Awaitable<T> = T | PromiseLike<T>


/** Like {@link fallible} but the inner function can return an {@link Awaitable} */
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


/**
 * A higher order function; returns a function which when called with a
 * {@link Result} will map the error channel if present to a new value.
 */
export function mapError<TOk, TError, TNewError>(
    func: (error: TError) => TNewError
): (result: Result<TOk, TError>) => Result<TOk, TNewError> {
    return result => result.ok
        ? result
        : error(func(result.value))
}


/**
 * A higher order function; returns a function which when called with a
 * {@link Result} allows inspecting the error channel if present.
 */
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


/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error}.
 */
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


/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionGuard`, otherwise it throws as usual.
 */
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


/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionType`, otherwise it throws as usual.
 */
export function catchExceptionByType<TOk, TError>(
    func: () => TOk,
    exceptionType: new (...args: any[]) => TError
): Result<TOk, TError> {
    return catchGuardedException(
        func,
        instanceOfGuard(exceptionType)
    )
}


/** Like {@link catchAnyException}, except the `func` can return an {@link Awaitable} */
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


/** Like {@link catchGuardedException}, except the `func` can return an {@link Awaitable} */
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


/** Like {@link catchExceptionByType}, except the `func` can return an {@link Awaitable} */
export function asyncCatchExceptionByType<TOk, TError>(
    func: () => Awaitable<TOk>,
    exceptionType: new (...args: any[]) => TError
): Promise<Result<TOk, TError>> {
    return asyncCatchGuardedException(
        func,
        instanceOfGuard(exceptionType)
    )
}


/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error}.
 */
export function wrapAnyException<TArgs extends any[], TReturn>(
    func: (...args: TArgs) => TReturn
): (...args: TArgs) => Result<TReturn, unknown> {
    return (...args) => catchAnyException(() => func(...args))
}


/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionGuard`, otherwise it throws as usual.
 */
export function wrapGuardedException<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => TReturn,
    exceptionGuard: (exception: unknown) => exception is TError
): (...args: TArgs) => Result<TReturn, TError> {
    return (...args) => catchGuardedException(() => func(...args), exceptionGuard)
}


/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionType`, otherwise it throws as usual.
 */
export function wrapExceptionByType<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => TReturn,
    exceptionType: new (...args: any[]) => TError
): (...args: TArgs) => Result<TReturn, TError> {
    return (...args) => catchExceptionByType(() => func(...args), exceptionType)
}


/** Like {@link wrapAnyException}, except the `func` can return an {@link Awaitable} */
export function asyncWrapAnyException<TArgs extends any[], TReturn>(
    func: (...args: TArgs) => Awaitable<TReturn>
): (...args: TArgs) => Promise<Result<TReturn, unknown>> {
    return (...args) => asyncCatchAnyException(() => func(...args))
}


/** Like {@link wrapGuardedException}, except the `func` can return an {@link Awaitable} */
export function asyncWrapGuardedException<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => Awaitable<TReturn>,
    exceptionGuard: (exception: unknown) => exception is TError
): (...args: TArgs) => Promise<Result<TReturn, TError>> {
    return (...args) => asyncCatchGuardedException(() => func(...args), exceptionGuard)
}


/** Like {@link wrapExceptionByType}, except the `func` can return an {@link Awaitable} */
export function asyncWrapExceptionByType<TArgs extends any[], TReturn, TError>(
    func: (...args: TArgs) => Awaitable<TReturn>,
    exceptionType: new (...args: any[]) => TError
): (...args: TArgs) => Promise<Result<TReturn, TError>> {
    return (...args) => asyncCatchExceptionByType(() => func(...args), exceptionType)
}

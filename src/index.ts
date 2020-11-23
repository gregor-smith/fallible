export class FallibleError<T> {
    public readonly value: T

    public constructor(value: T) {
        this.value = value
    }
}


export type Ok<T> = { ok: true, value: T }
export type Error<T> = { ok: false, value: T }
export type Result<TOk, TError> = Ok<TOk> | Error<TError>


export function propagate<TOk, TError>(fallible: Result<TOk, TError>): TOk {
    if (!fallible.ok) {
        throw new FallibleError(fallible.value)
    }
    return fallible.value
}


export function fallible<TOk, TError>(
    func: (
        propagate: <TReturn>(fallible: Result<TReturn, TError>) => TReturn
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
        propagate: <TReturn>(fallible: Result<TReturn, TError>) => TReturn
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


export function ok(): Ok<void>
export function ok<T>(value: T): Ok<T>
export function ok(value?: any) {
    return { ok: true, value }
}


export function error(): Error<void>
export function error<T>(value: T): Error<T>
export function error(value?: any) {
    return { ok: false, value }
}


export function mapError<TOk, TError, TNewError>(
    func: (error: TError) => TNewError
): (fallible: Result<TOk, TError>) => Result<TOk, TNewError> {
    return fallible => fallible.ok
        ? fallible
        : error(func(fallible.value))
}


export function tapError<TOk, TError>(
    func: (error: TError) => void
): (fallible: Result<TOk, TError>) => Result<TOk, TError> {
    return mapError(error => {
        func(error)
        return error
    })
}

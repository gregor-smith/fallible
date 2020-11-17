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
    func: () => Result<TOk, TError>
): Result<TOk, TError> {
    try {
        return func()
    }
    catch (exception: unknown) {
        if (exception instanceof FallibleError) {
            return error(exception.value)
        }
        throw exception
    }
}


export async function asyncFallible<TOk, TError>(
    func: () => Result<TOk, TError> | Promise<Result<TOk, TError>>
): Promise<Result<TOk, TError>> {
    try {
        return await func()
    }
    catch (exception: unknown) {
        if (exception instanceof FallibleError) {
            return error(exception.value)
        }
        throw exception
    }
}


export function ok<T>(value: T): Ok<T> {
    return { ok: true, value }
}


export function error<T>(value: T): Error<T> {
    return { ok: false, value }
}


export function mapError<TOk, TError, TNewError>(
    func: (error: TError) => TNewError
): (fallible: Result<TOk, TError>) => Result<TOk, TNewError> {
    return fallible => fallible.ok
        ? fallible
        : error(func(fallible.value))
}

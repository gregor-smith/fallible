class FallibleError<T> {
    public readonly value: T

    public constructor(value: T) {
        this.value = value
    }
}


export type Ok<T> = { ok: true, value: T }
export type Error<T> = { ok: false, value: T }
export type Fallible<TOk, TError> = Ok<TOk> | Error<TError>


export type FallibleArgs<TOk, TError> = {
    ok: (value: TOk) => Fallible<TOk, TError>
    error: (value: TError) => Fallible<TOk, TError>
    propagate: <TReturn>(fallible: Fallible<TReturn, TError>) => TReturn
}

export type FallibleFunc<TOk, TError> = (args: FallibleArgs<TOk, TError>) => Fallible<TOk, TError>


export function fallible<TOk, TError>(
    func: FallibleFunc<TOk, TError>
): Fallible<TOk, TError> {
    try {
        return func({
            ok,
            error,
            propagate: fallible => {
                if (!fallible.ok) {
                    throw new FallibleError(fallible.value)
                }
                return fallible.value
            }
        })
    }
    catch (exception: unknown) {
        if (exception instanceof FallibleError) {
            return error(exception.value)
        }
        throw exception
    }
}


export type AsyncFallibleArgs<TOk, TError> = {
    ok: (value: TOk) => Fallible<TOk, TError> | Promise<Fallible<TOk, TError>>
    error: (value: TError) => Fallible<TOk, TError> | Promise<Fallible<TOk, TError>>
    propagate: <TReturn>(fallible: Fallible<TReturn, TError>) => TReturn
}

export type AsyncFallibleFunc<TOk, TError> = (args: AsyncFallibleArgs<TOk, TError>) => Fallible<TOk, TError> | Promise<Fallible<TOk, TError>>


export async function asyncFallible<TOk, TError>(
    func: AsyncFallibleFunc<TOk, TError>
): Promise<Fallible<TOk, TError>> {
    try {
        return await func({
            ok,
            error,
            propagate: fallible => {
                if (!fallible.ok) {
                    throw new FallibleError(fallible.value)
                }
                return fallible.value
            }
        })
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
): (fallible: Fallible<TOk, TError>) => Fallible<TOk, TNewError> {
    return fallible => fallible.ok
        ? fallible
        : error(func(fallible.value))
}

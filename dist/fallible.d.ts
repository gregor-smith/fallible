export type Ok<T> = {
    ok: true;
    value: T;
};
export type Error<T> = {
    ok: false;
    value: T;
};
export type Result<TOk, TError> = Ok<TOk> | Error<TError>;
/**
 * Takes a function with a single function argument; when this `propagate`
 * argument is passed a {@link Result}, the {@link Error} channel if present is
 * immediately propagated and returned, otherwise the value of the {@link Ok}
 * channel is returned and execution continues.
 */
export declare function fallible<TOk, TError>(func: (propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn) => Result<TOk, TError>): Result<TOk, TError>;
/** Any value that produces `T` when `await`ed */
export type Awaitable<T> = T | PromiseLike<T>;
/** Like {@link fallible} but the inner function can return an {@link Awaitable} */
export declare function asyncFallible<TOk, TError>(func: (propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn) => Awaitable<Result<TOk, TError>>): Promise<Result<TOk, TError>>;
export declare function ok<T extends void>(): Ok<T>;
export declare function ok<T>(value: T): Ok<T>;
export declare function error<T extends void>(): Error<T>;
export declare function error<T>(value: T): Error<T>;
/**
 * A higher order function; returns a function which when called with a
 * {@link Result} will map the error channel if present to a new value.
 */
export declare function mapError<TOk, TError, TNewError>(func: (error: TError) => TNewError): (result: Result<TOk, TError>) => Result<TOk, TNewError>;
/**
 * A higher order function; returns a function which when called with a
 * {@link Result} allows inspecting the error channel if present.
 */
export declare function tapError<TOk, TError>(func: (error: TError) => void): (result: Result<TOk, TError>) => Result<TOk, TError>;
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error}.
 */
export declare function catchAnyException<TOk>(func: () => TOk): Result<TOk, unknown>;
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionGuard`, otherwise it throws as usual.
 */
export declare function catchGuardedException<TOk, TError>(func: () => TOk, exceptionGuard: (exception: unknown) => exception is TError): Result<TOk, TError>;
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionType`, otherwise it throws as usual.
 */
export declare function catchExceptionByType<TOk, TError>(func: () => TOk, exceptionType: new (...args: any[]) => TError): Result<TOk, TError>;
/** Like {@link catchAnyException}, except the `func` can return an {@link Awaitable} */
export declare function asyncCatchAnyException<TOk>(func: () => Awaitable<TOk>): Promise<Result<TOk, unknown>>;
/** Like {@link catchGuardedException}, except the `func` can return an {@link Awaitable} */
export declare function asyncCatchGuardedException<TOk, TError>(func: () => Awaitable<TOk>, exceptionGuard: (exception: unknown) => exception is TError): Promise<Result<TOk, TError>>;
/** Like {@link catchExceptionByType}, except the `func` can return an {@link Awaitable} */
export declare function asyncCatchExceptionByType<TOk, TError>(func: () => Awaitable<TOk>, exceptionType: new (...args: any[]) => TError): Promise<Result<TOk, TError>>;
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error}.
 */
export declare function wrapAnyException<TArgs extends any[], TReturn>(func: (...args: TArgs) => TReturn): (...args: TArgs) => Result<TReturn, unknown>;
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionGuard`, otherwise it throws as usual.
 */
export declare function wrapGuardedException<TArgs extends any[], TReturn, TError>(func: (...args: TArgs) => TReturn, exceptionGuard: (exception: unknown) => exception is TError): (...args: TArgs) => Result<TReturn, TError>;
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionType`, otherwise it throws as usual.
 */
export declare function wrapExceptionByType<TArgs extends any[], TReturn, TError>(func: (...args: TArgs) => TReturn, exceptionType: new (...args: any[]) => TError): (...args: TArgs) => Result<TReturn, TError>;
/** Like {@link wrapAnyException}, except the `func` can return an {@link Awaitable} */
export declare function asyncWrapAnyException<TArgs extends any[], TReturn>(func: (...args: TArgs) => Awaitable<TReturn>): (...args: TArgs) => Promise<Result<TReturn, unknown>>;
/** Like {@link wrapGuardedException}, except the `func` can return an {@link Awaitable} */
export declare function asyncWrapGuardedException<TArgs extends any[], TReturn, TError>(func: (...args: TArgs) => Awaitable<TReturn>, exceptionGuard: (exception: unknown) => exception is TError): (...args: TArgs) => Promise<Result<TReturn, TError>>;
/** Like {@link wrapExceptionByType}, except the `func` can return an {@link Awaitable} */
export declare function asyncWrapExceptionByType<TArgs extends any[], TReturn, TError>(func: (...args: TArgs) => Awaitable<TReturn>, exceptionType: new (...args: any[]) => TError): (...args: TArgs) => Promise<Result<TReturn, TError>>;

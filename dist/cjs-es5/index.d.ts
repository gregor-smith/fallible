export declare class FallibleError<T> {
    readonly value: T;
    constructor(value: T);
}
export declare type Ok<T> = {
    ok: true;
    value: T;
};
export declare type Error<T> = {
    ok: false;
    value: T;
};
export declare type Result<TOk, TError> = Ok<TOk> | Error<TError>;
export declare function propagate<TOk, TError>(fallible: Result<TOk, TError>): TOk;
export declare function fallible<TOk, TError>(func: (propagate: <TReturn>(fallible: Result<TReturn, TError>) => TReturn) => Result<TOk, TError>): Result<TOk, TError>;
export declare type Awaitable<T> = T | PromiseLike<T>;
export declare function asyncFallible<TOk, TError>(func: (propagate: <TReturn>(fallible: Result<TReturn, TError>) => TReturn) => Awaitable<Result<TOk, TError>>): Promise<Result<TOk, TError>>;
export declare function ok<T>(value: T): Ok<T>;
export declare function error<T>(value: T): Error<T>;
export declare function mapError<TOk, TError, TNewError>(func: (error: TError) => TNewError): (fallible: Result<TOk, TError>) => Result<TOk, TNewError>;
export declare function tapError<TOk, TError>(func: (error: TError) => void): (fallible: Result<TOk, TError>) => Result<TOk, TError>;

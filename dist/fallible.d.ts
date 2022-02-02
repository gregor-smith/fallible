export declare type Ok<T> = {
    ok: true;
    value: T;
};
export declare type Error<T> = {
    ok: false;
    value: T;
};
export declare type Result<TOk, TError> = Ok<TOk> | Error<TError>;
export declare function fallible<TOk, TError>(func: (propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn) => Result<TOk, TError>): Result<TOk, TError>;
export declare type Awaitable<T> = T | PromiseLike<T>;
export declare function asyncFallible<TOk, TError>(func: (propagate: <TReturn>(result: Result<TReturn, TError>) => TReturn) => Awaitable<Result<TOk, TError>>): Promise<Result<TOk, TError>>;
export declare function ok<T extends void>(): Ok<T>;
export declare function ok<T>(value: T): Ok<T>;
export declare function error<T extends void>(): Error<T>;
export declare function error<T>(value: T): Error<T>;
export declare function mapError<TOk, TError, TNewError>(func: (error: TError) => TNewError): (result: Result<TOk, TError>) => Result<TOk, TNewError>;
export declare function tapError<TOk, TError>(func: (error: TError) => void): (result: Result<TOk, TError>) => Result<TOk, TError>;
export declare function wrapException<TOk>(func: () => TOk): Result<TOk, unknown>;
export declare function wrapException<TOk, TError>(func: () => TOk, exceptionGuard: (exception: unknown) => exception is TError): Result<TOk, TError>;
export declare function wrapExceptionByType<TOk, TError>(func: () => TOk, exceptionType: new (...args: any[]) => TError): Result<TOk, TError>;
export declare function asyncWrapException<TOk>(func: () => Awaitable<TOk>): Promise<Result<TOk, unknown>>;
export declare function asyncWrapException<TOk, TError>(func: () => Awaitable<TOk>, exceptionGuard: (exception: unknown) => exception is TError): Promise<Result<TOk, TError>>;
export declare function asyncWrapExceptionByType<TOk, TError>(func: () => Awaitable<TOk>, exceptionType: new (...args: any[]) => TError): Promise<Result<TOk, TError>>;

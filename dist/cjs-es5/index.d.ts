export declare type Ok<T> = {
    ok: true;
    value: T;
};
export declare type Error<T> = {
    ok: false;
    value: T;
};
export declare type Fallible<TOk, TError> = Ok<TOk> | Error<TError>;
export declare function propagate<TOk, TError>(fallible: Fallible<TOk, TError>): TOk;
export declare function fallible<TOk, TError>(func: () => Fallible<TOk, TError>): Fallible<TOk, TError>;
export declare function asyncFallible<TOk, TError>(func: () => Fallible<TOk, TError> | Promise<Fallible<TOk, TError>>): Promise<Fallible<TOk, TError>>;
export declare function ok<T>(value: T): Ok<T>;
export declare function error<T>(value: T): Error<T>;
export declare function mapError<TOk, TError, TNewError>(func: (error: TError) => TNewError): (fallible: Fallible<TOk, TError>) => Fallible<TOk, TNewError>;

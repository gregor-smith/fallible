class FallibleError {
    constructor(value) {
        this.value = value;
    }
}
function propagate(result) {
    if (!result.ok) {
        throw new FallibleError(result.value);
    }
    return result.value;
}
/**
 * Takes a function with a single function argument; when this `propagate`
 * argument is passed a {@link Result}, the {@link Error} channel if present is
 * immediately propagated and returned, otherwise the value of the {@link Ok}
 * channel is returned and execution continues.
 */
export function fallible(func) {
    try {
        return func(propagate);
    }
    catch (exception) {
        if (exception instanceof FallibleError) {
            return error(exception.value);
        }
        throw exception;
    }
}
/** Like {@link fallible} but the inner function can return an {@link Awaitable} */
export async function asyncFallible(func) {
    try {
        return await func(propagate);
    }
    catch (exception) {
        if (exception instanceof FallibleError) {
            return error(exception.value);
        }
        throw exception;
    }
}
export function ok(value) {
    return { ok: true, value };
}
export function error(value) {
    return { ok: false, value };
}
/**
 * A higher order function; returns a function which when called with a
 * {@link Result} will map the error channel if present to a new value.
 */
export function mapError(func) {
    return result => result.ok
        ? result
        : error(func(result.value));
}
/**
 * A higher order function; returns a function which when called with a
 * {@link Result} allows inspecting the error channel if present.
 */
export function tapError(func) {
    return mapError(error => {
        func(error);
        return error;
    });
}
function guardOrThrow(exception, guard) {
    if (!guard(exception)) {
        throw exception;
    }
    return error(exception);
}
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error}.
 */
export function catchAnyException(func) {
    try {
        return ok(func());
    }
    catch (exception) {
        return error(exception);
    }
}
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionGuard`, otherwise it throws as usual.
 */
export function catchGuardedException(func, exceptionGuard) {
    try {
        return ok(func());
    }
    catch (exception) {
        return guardOrThrow(exception, exceptionGuard);
    }
}
function instanceOfGuard(type) {
    return (value) => value instanceof type;
}
/**
 * Calls the given `func` and returns its value in an {@link Ok}; if an
 * exception is thrown, it is returned in an {@link Error} if it matches the
 * given `exceptionType`, otherwise it throws as usual.
 */
export function catchExceptionByType(func, exceptionType) {
    return catchGuardedException(func, instanceOfGuard(exceptionType));
}
/** Like {@link catchAnyException}, except the `func` can return an {@link Awaitable} */
export async function asyncCatchAnyException(func) {
    try {
        return ok(await func());
    }
    catch (exception) {
        return error(exception);
    }
}
/** Like {@link catchGuardedException}, except the `func` can return an {@link Awaitable} */
export async function asyncCatchGuardedException(func, exceptionGuard) {
    try {
        return ok(await func());
    }
    catch (exception) {
        return guardOrThrow(exception, exceptionGuard);
    }
}
/** Like {@link catchExceptionByType}, except the `func` can return an {@link Awaitable} */
export function asyncCatchExceptionByType(func, exceptionType) {
    return asyncCatchGuardedException(func, instanceOfGuard(exceptionType));
}
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error}.
 */
export function wrapAnyException(func) {
    return (...args) => catchAnyException(() => func(...args));
}
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionGuard`, otherwise it throws as usual.
 */
export function wrapGuardedException(func, exceptionGuard) {
    return (...args) => catchGuardedException(() => func(...args), exceptionGuard);
}
/**
 * Wraps the given `func` and returns a new function, which when called will
 * return the original return value in an {@link Ok}; if an exception is
 * thrown, it is returned in an {@link Error} if it matches the given
 * `exceptionType`, otherwise it throws as usual.
 */
export function wrapExceptionByType(func, exceptionType) {
    return (...args) => catchExceptionByType(() => func(...args), exceptionType);
}
/** Like {@link wrapAnyException}, except the `func` can return an {@link Awaitable} */
export function asyncWrapAnyException(func) {
    return (...args) => asyncCatchAnyException(() => func(...args));
}
/** Like {@link wrapGuardedException}, except the `func` can return an {@link Awaitable} */
export function asyncWrapGuardedException(func, exceptionGuard) {
    return (...args) => asyncCatchGuardedException(() => func(...args), exceptionGuard);
}
/** Like {@link wrapExceptionByType}, except the `func` can return an {@link Awaitable} */
export function asyncWrapExceptionByType(func, exceptionType) {
    return (...args) => asyncCatchExceptionByType(() => func(...args), exceptionType);
}
//# sourceMappingURL=fallible.js.map
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
export function mapError(func) {
    return result => result.ok
        ? result
        : error(func(result.value));
}
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
export function catchAnyException(func) {
    try {
        return ok(func());
    }
    catch (exception) {
        return error(exception);
    }
}
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
export function catchExceptionByType(func, exceptionType) {
    return catchGuardedException(func, instanceOfGuard(exceptionType));
}
export async function asyncCatchAnyException(func) {
    try {
        return ok(await func());
    }
    catch (exception) {
        return error(exception);
    }
}
export async function asyncCatchGuardedException(func, exceptionGuard) {
    try {
        return ok(await func());
    }
    catch (exception) {
        return guardOrThrow(exception, exceptionGuard);
    }
}
export function asyncCatchExceptionByType(func, exceptionType) {
    return asyncCatchGuardedException(func, instanceOfGuard(exceptionType));
}
export function wrapAnyException(func) {
    return (...args) => catchAnyException(() => func(...args));
}
export function wrapGuardedException(func, exceptionGuard) {
    return (...args) => catchGuardedException(() => func(...args), exceptionGuard);
}
export function wrapExceptionByType(func, exceptionType) {
    return (...args) => catchExceptionByType(() => func(...args), exceptionType);
}
export function asyncWrapAnyException(func) {
    return (...args) => asyncCatchAnyException(() => func(...args));
}
export function asyncWrapGuardedException(func, exceptionGuard) {
    return (...args) => asyncCatchGuardedException(() => func(...args), exceptionGuard);
}
export function asyncWrapExceptionByType(func, exceptionType) {
    return (...args) => asyncCatchExceptionByType(() => func(...args), exceptionType);
}
//# sourceMappingURL=fallible.js.map
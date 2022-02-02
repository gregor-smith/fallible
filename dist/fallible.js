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
function dummyGuard(_value) {
    return true;
}
function guardOrThrow(exception, guard) {
    if (!guard(exception)) {
        throw exception;
    }
    return error(exception);
}
export function wrapException(func, exceptionGuard = dummyGuard) {
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
export function wrapExceptionByType(func, exceptionType) {
    return wrapException(func, instanceOfGuard(exceptionType));
}
export async function asyncWrapException(func, exceptionGuard = dummyGuard) {
    try {
        return ok(await func());
    }
    catch (exception) {
        return guardOrThrow(exception, exceptionGuard);
    }
}
export function asyncWrapExceptionByType(func, exceptionType) {
    return asyncWrapException(func, instanceOfGuard(exceptionType));
}
//# sourceMappingURL=fallible.js.map
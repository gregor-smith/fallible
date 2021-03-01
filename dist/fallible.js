export class FallibleError {
    constructor(value) {
        this.value = value;
    }
}
export function propagate(result) {
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
//# sourceMappingURL=fallible.js.map
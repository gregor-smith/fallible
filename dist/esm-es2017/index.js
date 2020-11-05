class FallibleError {
    constructor(value) {
        this.value = value;
    }
}
export function propagate(fallible) {
    if (!fallible.ok) {
        throw new FallibleError(fallible.value);
    }
    return fallible.value;
}
export function fallible(func) {
    try {
        return func();
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
        return await func();
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
    return fallible => fallible.ok
        ? fallible
        : error(func(fallible.value));
}
//# sourceMappingURL=index.js.map
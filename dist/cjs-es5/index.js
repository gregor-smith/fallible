"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapError = exports.mapError = exports.error = exports.ok = exports.asyncFallible = exports.fallible = exports.propagate = exports.FallibleError = void 0;
var tslib_1 = require("tslib");
var FallibleError = /** @class */ (function () {
    function FallibleError(value) {
        this.value = value;
    }
    return FallibleError;
}());
exports.FallibleError = FallibleError;
function propagate(fallible) {
    if (!fallible.ok) {
        throw new FallibleError(fallible.value);
    }
    return fallible.value;
}
exports.propagate = propagate;
function fallible(func) {
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
exports.fallible = fallible;
function asyncFallible(func) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var exception_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, func()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    exception_1 = _a.sent();
                    if (exception_1 instanceof FallibleError) {
                        return [2 /*return*/, error(exception_1.value)];
                    }
                    throw exception_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.asyncFallible = asyncFallible;
function ok(value) {
    return { ok: true, value: value };
}
exports.ok = ok;
function error(value) {
    return { ok: false, value: value };
}
exports.error = error;
function mapError(func) {
    return function (fallible) { return fallible.ok
        ? fallible
        : error(func(fallible.value)); };
}
exports.mapError = mapError;
function tapError(func) {
    return mapError(function (error) {
        func(error);
        return error;
    });
}
exports.tapError = tapError;
//# sourceMappingURL=index.js.map
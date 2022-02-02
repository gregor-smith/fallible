import {
    fallible,
    error,
    ok,
    Result,
    asyncFallible,
    mapError,
    tapError,
    wrapException,
    asyncWrapException,
    wrapExceptionByType,
    asyncWrapExceptionByType
} from './fallible.js'


type ParseJSONError = 'InvalidJSON'

function parseJSON<T = unknown>(json: string): Result<T, ParseJSONError> {
    let value: T
    try {
        value = JSON.parse(json)
    }
    catch {
        return error('InvalidJSON' as const)
    }
    return ok(value)
}


type ParseIntegerError = 'NotInteger'

function parseInteger(value: string): Result<number, ParseIntegerError> {
    const number = Number(value)
    if (!Number.isSafeInteger(number)) {
        return error('NotInteger' as const)
    }
    return ok(number)
}


type ParseError = ParseJSONError | ParseIntegerError


describe('fallible', () => {
    test('ok chain', () => {
        const result = fallible<number, ParseError>(propagate => {
            const json = propagate(parseJSON<string>('"1"'))
            expect(json).toBe('1')
            const number = propagate(parseInteger(json))
            expect(number).toBe(1)
            return ok(number + 1)
        })
        expect(result).toEqual<typeof result>(ok(2))
    })

    test('first error propagates', () => {
        const result = fallible<number, ParseError>(propagate => {
            propagate(parseJSON<string>('{'))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('InvalidJSON' as const))
    })

    test('second error propagates', () => {
        const result = fallible<number, ParseError>(propagate => {
            const json = propagate(parseJSON<string>('"a"'))
            propagate(parseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger' as const))
    })
})


function asyncParseJSON<T = unknown>(json: string): Promise<Result<T, ParseJSONError>> {
    return Promise.resolve(parseJSON(json))
}


function asyncParseInteger(value: string): Promise<Result<number, ParseIntegerError>> {
    return Promise.resolve(parseInteger(value))
}


describe('asyncFallible', () => {
    test('ok chain', async () => {
        const result = await asyncFallible<number, ParseError>(async propagate => {
            const json = propagate(await asyncParseJSON<string>('"1"'))
            expect(json).toBe('1')
            const number = propagate(await asyncParseInteger(json))
            expect(number).toBe(1)
            return ok(number + 1)
        })
        expect(result).toEqual<typeof result>(ok(2))
    })

    test('first error propagates', async () => {
        const result = await asyncFallible<number, ParseError>(async propagate => {
            propagate(await asyncParseJSON<string>('{'))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('InvalidJSON' as const))
    })

    test('second error propagates', async () => {
        const result = await asyncFallible<number, ParseError>(async propagate => {
            const json = propagate(await asyncParseJSON<string>('"a"'))
            propagate(await asyncParseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger' as const))
    })
})


describe('mapError', () => {
    const mapper = mapError<string, any, 'test'>(() => 'test')

    test('maps error', () => {
        const result = mapper(error('hello'))
        expect(result).toEqual<typeof result>(error('test' as const))
    })

    test('does not map ok', () => {
        const result = mapper(ok('hello'))
        expect(result).toEqual<typeof result>(ok('hello'))
    })
})


describe('tapError', () => {
    const mock = jest.fn<void, [ string ]>()
    afterEach(jest.clearAllMocks)
    const tapper = tapError<string, string>(mock)

    test('taps error', () => {
        const result = tapper(error('hello'))
        expect(result).toEqual<typeof result>(error('hello'))
        expect(mock).toHaveBeenCalledTimes(1)
        expect(mock).toHaveBeenCalledWith('hello')
    })

    test('does not tap ok', () => {
        const result = tapper(ok('hello'))
        expect(result).toEqual<typeof result>(ok('hello'))
        expect(mock).not.toHaveBeenCalled()
    })
})


function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}


describe('wrapException', () => {
    describe('no guard', () => {
        test('no exception returns ok', () => {
            const result = wrapException(() => 123)
            expect(result).toEqual<typeof result>(ok(123))
        })

        test('exception returns error', () => {
            const result = wrapException(() => { throw 123 })
            expect(result).toEqual<typeof result>(error(123))
        })
    })

    describe('guard', () => {
        test('no exception returns ok', () => {
            const result = wrapException(() => 123, isNumber)
            expect(result).toEqual<typeof result>(ok(123))
        })

        test('exception matching guard returns error', () => {
            const result = wrapException(() => { throw 123 }, isNumber)
            expect(result).toEqual<typeof result>(error(123))
        })

        test('exception not matching guard throws', () => {
            expect.assertions(1)
            try {
                wrapException(() => { throw '123' }, isNumber)
            }
            catch (exception) {
                expect(exception).toEqual('123')
            }
        })
    })
})


class TestError<T> extends Error {
    public constructor(
        public readonly value: T
    ) {
        super()
    }
}


describe('wrapExceptionByType', () => {
    test('no exception returns ok', () => {
        const result = wrapExceptionByType(() => 123, TestError)
        expect(result).toEqual<typeof result>(ok(123))
    })

    test('exception matching guard returns error', () => {
        const result = wrapExceptionByType(() => { throw new TestError(123) }, TestError)
        expect(result).toEqual<typeof result>(error(new TestError(123)))
    })

    test('exception not matching guard throws', () => {
        expect.assertions(1)
        try {
            wrapExceptionByType(() => { throw '123' }, TestError)
        }
        catch (exception) {
            expect(exception).toEqual('123')
        }
    })
})


describe('asyncWrapException', () => {
    describe('no guard', () => {
        test('no exception returns ok', async () => {
            const result = await asyncWrapException(() => Promise.resolve(123))
            expect(result).toEqual<typeof result>(ok(123))
        })

        test('exception returns error', async () => {
            const result = await asyncWrapException(() => { throw 123 })
            expect(result).toEqual<typeof result>(error(123))
        })

        test('reject returns error', async () => {
            const result = await asyncWrapException(() => Promise.reject(123))
            expect(result).toEqual<typeof result>(error(123))
        })
    })

    describe('guard', () => {
        test('no exception returns ok', async () => {
            const result = await asyncWrapException(() => 123, isNumber)
            expect(result).toEqual<typeof result>(ok(123))
        })

        test('exception matching guard returns error', async () => {
            const result = await asyncWrapException(() => { throw 123 }, isNumber)
            expect(result).toEqual<typeof result>(error(123))
        })

        test('exception not matching guard throws', async () => {
            expect.assertions(1)
            try {
                await asyncWrapException(() => { throw '123' }, isNumber)
            }
            catch (exception) {
                expect(exception).toEqual('123')
            }
        })

        test('reject matching guard returns error', async () => {
            const result = await asyncWrapException(() => Promise.reject(123), isNumber)
            expect(result).toEqual<typeof result>(error(123))
        })

        test('reject not matching guard throws', async () => {
            expect.assertions(1)
            try {
                await asyncWrapException(() => Promise.reject('123'), isNumber)
            }
            catch (exception) {
                expect(exception).toEqual('123')
            }
        })
    })
})


describe('asyncWrapExceptionByType', () => {
    test('no exception returns ok', async () => {
        const result = await asyncWrapExceptionByType(() => 123, TestError)
        expect(result).toEqual<typeof result>(ok(123))
    })

    test('exception matching guard returns error', async () => {
        const result = await asyncWrapExceptionByType(() => { throw new TestError(123) }, TestError)
        expect(result).toEqual<typeof result>(error(new TestError(123)))
    })

    test('exception not matching guard throws', async () => {
        expect.assertions(1)
        try {
            await asyncWrapExceptionByType(() => { throw '123' }, TestError)
        }
        catch (exception) {
            expect(exception).toEqual('123')
        }
    })

    test('reject matching guard returns error', async () => {
        const result = await asyncWrapExceptionByType(() => Promise.reject(new TestError(123)), TestError)
        expect(result).toEqual<typeof result>(error(new TestError(123)))
    })

    test('reject not matching guard throws', async () => {
        expect.assertions(1)
        try {
            await asyncWrapExceptionByType(() => Promise.reject('123'), TestError)
        }
        catch (exception) {
            expect(exception).toEqual('123')
        }
    })
})

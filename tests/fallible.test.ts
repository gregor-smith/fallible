import { fallible, error, ok, Result, asyncFallible, mapError, tapError } from '../src'



type ParseJSONError = 'InvalidJSON'

function parseJSON<T = unknown>(json: string): Result<T, ParseJSONError> {
    let value: T
    try {
        value = JSON.parse(json)
    }
    catch {
        return error('InvalidJSON')
    }
    return ok(value)
}


type ParseIntegerError = 'NotInteger'

function parseInteger(value: string): Result<number, ParseIntegerError> {
    const number = Number(value)
    if (!Number.isSafeInteger(number)) {
        return error('NotInteger')
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
        expect(result).toEqual<typeof result>(error('InvalidJSON'))
    })

    test('second error propagates', () => {
        const result = fallible<number, ParseError>(propagate => {
            const json = propagate(parseJSON<string>('"a"'))
            propagate(parseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger'))
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
        expect(result).toEqual<typeof result>(error('InvalidJSON'))
    })

    test('second error propagates', async () => {
        const result = await asyncFallible<number, ParseError>(async propagate => {
            const json = propagate(await asyncParseJSON<string>('"a"'))
            propagate(await asyncParseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger'))
    })
})


describe('mapError', () => {
    const mapper = mapError<string, any, 'test'>(() => 'test')

    test('maps error', () => {
        const result = mapper(error('hello'))
        expect(result).toEqual<typeof result>(error('test'))
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

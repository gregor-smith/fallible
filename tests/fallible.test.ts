import { fallible, error, ok, propagate, Fallible, asyncFallible, mapError } from '../src'



type ParseJSONError = 'InvalidJSON'

function parseJSON<T = unknown>(json: string): Fallible<T, ParseJSONError> {
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

function parseInteger(value: string): Fallible<number, ParseIntegerError> {
    const number = Number(value)
    if (!Number.isSafeInteger(number)) {
        return error('NotInteger')
    }
    return ok(number)
}


type ParseError = ParseJSONError | ParseIntegerError


describe('fallible', () => {
    test('ok chain', () => {
        const result = fallible<number, ParseError>(() => {
            const json = propagate(parseJSON<string>('"1"'))
            expect(json).toBe('1')
            const number = propagate(parseInteger(json))
            expect(number).toBe(1)
            return ok(number + 1)
        })
        expect(result).toEqual<typeof result>(ok(2))
    })

    test('first error propagates', () => {
        const result = fallible<number, ParseError>(() => {
            propagate(parseJSON<string>('{'))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('InvalidJSON'))
    })

    test('second error propagates', () => {
        const result = fallible<number, ParseError>(() => {
            const json = propagate(parseJSON<string>('"a"'))
            propagate(parseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger'))
    })
})


function asyncParseJSON<T = unknown>(json: string): Promise<Fallible<T, ParseJSONError>> {
    return Promise.resolve(parseJSON(json))
}


function asyncParseInteger(value: string): Promise<Fallible<number, ParseIntegerError>> {
    return Promise.resolve(parseInteger(value))
}


describe('asyncFallible', () => {
    test('ok chain', async () => {
        const result = await asyncFallible<number, ParseError>(async () => {
            const json = propagate(await asyncParseJSON<string>('"1"'))
            expect(json).toBe('1')
            const number = propagate(await asyncParseInteger(json))
            expect(number).toBe(1)
            return ok(number + 1)
        })
        expect(result).toEqual<typeof result>(ok(2))
    })

    test('first error propagates', async () => {
        const result = await asyncFallible<number, ParseError>(async () => {
            debugger
            propagate(await asyncParseJSON<string>('{'))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('InvalidJSON'))
    })

    test('second error propagates', async () => {
        const result = await asyncFallible<number, ParseError>(async () => {
            const json = propagate(await asyncParseJSON<string>('"a"'))
            propagate(await asyncParseInteger(json))
            throw 'This should be unreachable'
        })
        expect(result).toEqual<typeof result>(error('NotInteger'))
    })
})


test('mapError', () => {
    const result = fallible<string, 'test'>(() => {
        propagate(
            mapError(() => 'test' as const)(parseJSON('{'))
        )
        throw 'This should be unreachable'
    })
    expect(result).toEqual<typeof result>(error('test'))
})

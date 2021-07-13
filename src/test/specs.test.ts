import assert from 'assert';

import { Schema } from '../main';

interface Person {
    name: string;
    age?: number;
    gender: string | null;
}

const Person = new Schema<Person>({
    schema: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            age: { type: 'number', optional: true },
            gender: { type: 'string', nullable: true },
        }
    }
});

interface Book {
    title: string;
    year: number;
    tags: string[];
    author: Person;
}

const Book: Schema<Book> = new Schema<Book>({
    schema: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1 },
            year: { type: 'integer', minimum: 0, maximum: 3000 },
            tags: {
                type: 'array',
                items: { type: 'string', minLength: 1 },
            },
            author: Person.schema,
        }
    }
});

describe('Schema', () => {

    it('returns processed schema', () => {
        assert.deepStrictEqual(Book.schema, {
            type: 'object',
            required: ['title', 'year', 'tags', 'author'],
            properties: {
                title: { type: 'string', minLength: 1 },
                year: { type: 'integer', minimum: 0, maximum: 3000 },
                tags: {
                    type: 'array',
                    items: { type: 'string', minLength: 1 },
                },
                author: {
                    type: 'object',
                    required: ['name', 'gender'],
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number', optional: true },
                        gender: { type: 'string', nullable: true },
                    },
                    additionalProperties: false,
                }
            },
            additionalProperties: false,
        });
    });

    describe('decode', () => {

        it('removes additional properties', () => {
            const book = Book.decode({
                title: 'The Adventures of Foo',
                year: 2020,
                tags: ['foo', 'bar'],
                something: 'boo',
                author: { name: 'Joe', gender: null },
            }) as any;
            assert(typeof book.something === 'undefined');
        });

        it('throws ValidationError if not valid', () => {
            try {
                Book.decode({
                    title: 'The Adventures of Foo',
                    year: 2020,
                    tags: 'lol wut',
                    author: { name: 'Joe', age: 'ok' }
                });
                throw new Error('UnexpectedSuccess');
            } catch (err) {
                assert.strictEqual(err.name, 'ValidationError');
            }
        });
    });

});

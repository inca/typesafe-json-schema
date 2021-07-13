import Ajv, { ErrorObject, Options as AjvOptions, ValidateFunction } from 'ajv';

import { JsonSchema } from './types';
import { buildSchema } from './utils';

export class Schema<T> {
    ajv: Ajv;
    schema: JsonSchema<T>;
    validateFn: ValidateFunction<T>;

    constructor(
        init: SchemaInit<T>
    ) {
        const {
            schema,
            ajvOptions = {},
        } = init;
        this.schema = buildSchema(schema);
        this.ajv = new Ajv({
            removeAdditional: 'all',
            useDefaults: true,
            coerceTypes: true,
            keywords: ['optional', 'name', 'description'],
            ...ajvOptions
        });
        this.validateFn = this.ajv.compile<T>(this.schema as any);
    }

    decode(obj: any): T {
        const valid = this.validateFn(obj);
        if (!valid) {
            const errors = this.validateFn.errors ?? [];
            const messages = errors.map(_ => `${_.instancePath} ${_.message}`);
            const error = new Error(`Validation failed: ${messages.join('; ')}`);
            error.name = 'ValidationError';
            (error as any).status = 400;
            throw error;
        }
        return obj;
    }

    validate(obj: any): ErrorObject[] {
        const valid = this.validateFn(obj);
        return valid ? [] : this.validateFn.errors ?? [];
    }

    is(obj: any): obj is T {
        return this.validateFn(obj);
    }

}

interface SchemaInit<T> {
    schema: JsonSchema<T>;
    ajvOptions?: AjvOptions;
}

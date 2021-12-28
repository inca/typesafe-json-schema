import { JsonSchema } from './types';

export function buildSchema<T>(jsonSchema: JsonSchema<T>): JsonSchema<T> {
    return JSON.parse(JSON.stringify(jsonSchema), (k, v) => {
        if (v && typeof v === 'object' && v.type === 'object') {
            if (v.required === undefined) {
                const required = new Set();
                const properties = v.properties || {};
                for (const [key, value] of Object.entries<JsonSchema<any>>(properties)) {
                    const optional = value.optional || false;
                    if (!optional) {
                        required.add(key);
                    }
                }
                v.required = [...required];
            }
            if (v.additionalProperties === undefined) {
                v.additionalProperties = false;
            }
        }
        return v;
    });
}

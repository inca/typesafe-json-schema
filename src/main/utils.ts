import { JsonSchema } from './types';

export interface SchemaOptions {
    requiredByDefault?: boolean;
    noAdditionalProperties?: boolean;
}

/**
 * Preprocesses custom JSON schema into standards-compliant. All options are `true` by default.
 *
 * - if `requiredByDefaut`, uses `optional` keyword to build `required` field for objects
 * - if `noAdditionalProperties`, adds `additionalProperties = false` (useful with auto-removing additionals)
 */
export function buildSchema<T>(jsonSchema: JsonSchema<T>, options: SchemaOptions = {}): JsonSchema<T> {
    const {
        requiredByDefault = true,
        noAdditionalProperties = true,
    } = options;
    return JSON.parse(JSON.stringify(jsonSchema), (k, v) => {
        if (v && typeof v === 'object' && v.type === 'object') {
            if (requiredByDefault) {
                const required = new Set(Array.isArray(v.required) ? v.required : []);
                const properties = v.properties || {};
                for (const [key, value] of Object.entries<JsonSchema<any>>(properties)) {
                    const optional = value.optional || false;
                    if (!optional) {
                        required.add(key);
                    }
                }
                v.required = [...required];
            }
            if (noAdditionalProperties) {
                v.additionalProperties = false;
            }
        }
        return v;
    });
}

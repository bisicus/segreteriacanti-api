/**
 * Returns the properties of a type that start with a given prefix
 * @since 1.0.0
 */
export type ExtractPropertiesWithPrefix<T, Prefix extends string> = {
  [K in keyof T]: K extends `${Prefix}${string}` ? K : never;
}[keyof T];

/**
 * Extracts the Array from an "array or non-array" type
 * @example
 * type OnlyStringArray = ExtractArrayType<string|string[]> // string[]
 *
 * type MyType = { name: string; age: number };
 * type OnlyStringArray = ExtractArrayType<MyType|MyType[]> // MyType[]
 * @since 1.0.0
 */
export type ExtractArrayType<T> = T extends (infer U)[] ? U[] : never;

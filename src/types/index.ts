/**
 * Returns the properties of a type that start with a given prefix
 * @since 1.0.0
 */
export type ExtractPropertiesWithPrefix<T, Prefix extends string> = {
  [K in keyof T]: K extends `${Prefix}${string}` ? K : never;
}[keyof T];

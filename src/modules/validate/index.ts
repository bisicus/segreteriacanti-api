import type { AnyZodObject, z, ZodArray } from 'zod';

import ValidationError from '../../errors/ValidationError';
import type { ModuleAssets } from '../../middlewares/moduleAssets';

/**
 * @throws {ValidationError}
 * @since 1.0.0
 * @todo wrap ZodError in custom error object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validate<T extends AnyZodObject | ZodArray<any, any>>(_moduleAssets: ModuleAssets, data: any, schema: T): z.infer<T> {
  const validateResult = schema.safeParse(data);
  if (validateResult.success === false) {
    throw new ValidationError(validateResult.error);
  }
  return data;
}

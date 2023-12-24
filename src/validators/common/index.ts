import { z } from 'zod';

/**
 * return a validator function for an ID
 * @since 1.0.0
 * @todo custom error messages
 */
export const IDValidator = () => z.coerce.number().positive();

import type { Prisma } from '@prisma/client';

import type { ExtractArrayType } from '.';

/**
 * All prisma model names
 * @since 1.0.0
 */
export type PrismaModelName = keyof typeof Prisma.ModelName;

/**
 * A `findMany` type common to all prisma models
 * @since 1.0.0
 */
export type PrismaFindManyArgsType<T extends PrismaModelName> = Prisma.TypeMap['model'][T]['operations']['findMany']['args'];

/**
 * A `whereInput` type common to all prisma models
 * @since 1.0.0
 */
export type PrismaWhereType<T extends PrismaModelName> = NonNullable<PrismaFindManyArgsType<T>['where']>;

/**
 * A "AND" `whereInput` type common to all prisma models
 * @since 1.0.0
 */
export type PrismaWhereAndType<T extends PrismaModelName> = NonNullable<PrismaWhereType<T>['AND']>;

/**
 * A "AND" `whereInput` type common to all prisma models, that is only array.
 * @since 1.0.0
 */
export type PrismaWhereAndTypeArrayOnly<T extends PrismaModelName> = ExtractArrayType<PrismaWhereAndType<T>>;

/**
 * A "OR" `whereInput` type common to all prisma models
 * @since 1.0.0
 */
export type PrismaWhereOrType<T extends PrismaModelName> = NonNullable<PrismaWhereType<T>['OR']>;

import { StatusCodes } from 'http-status-codes';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import type { PrismaModelName, PrismaWhereAndTypeArrayOnly, PrismaWhereOrType, PrismaWhereType } from '../../types/prisma';

/**
 * append a array of "OR-ready prisma objects" to the prisma "where object". `OR` condition is created if not-existant
 * @since 1.0.0
 */
export const createOrAppendOrConditions = <T extends PrismaModelName>(
  filters: PrismaWhereType<T>,
  orConditions: PrismaWhereOrType<T>
): PrismaWhereType<T> => {
  if (orConditions.length) {
    if (Array.isArray(filters.OR)) {
      // @ts-expect-error `push` morphs the '|' to "&" making the compiler go crazy
      filters.OR.push(orConditions);
    } else {
      filters.OR = orConditions;
    }
  }
  return filters;
};

/**
 * append a array of "OR-ready prisma objects" to the prisma "where object". `OR` condition is created if not-existant
 * @since 1.0.0
 */
export const createOrAppendAndConditions = <T extends PrismaModelName>(
  filters: PrismaWhereType<T>,
  andConditions: PrismaWhereAndTypeArrayOnly<T>
): PrismaWhereType<T> => {
  if (andConditions.length) {
    if (Array.isArray(filters.AND)) {
      // @ts-expect-error `push` morphs the '|' to "&" making the compiler go crazy
      filters.AND.push(andConditions);
    } else {
      filters.AND = andConditions;
    }
  }
  return filters;
};

/**
 * Check if the conditions specified in input array should be considered using `AND` or `OR` clause.
 * Operator must be the first element of the array
 * Operator is removed from the array itself
 * @param filterValues filters to be applied
 * @param filterName property corresponding the filters are extracted from
 * @since 1.0.0
 */
export const checkAndOrOperator = (filterValues: string[], filterName: string): boolean => {
  // default behavior: "where conditions" are considered with "AND" clauses
  let useAndCondition = true;

  if (filterValues[0] === config.application.findFilters.operators.or) {
    // "where conditions" are considered with "OR" clauses
    useAndCondition = false;
    // remove the clause
    filterValues.shift();
  } else if (filterValues[0] === config.application.findFilters.operators.and) {
    // remove the clause
    filterValues.shift();
  }

  // needed after shift
  if (filterValues.length === 0) {
    throw new BaseError('validation', `'${filterName}' is an empty list`, StatusCodes.BAD_REQUEST);
  }

  return useAndCondition;
};

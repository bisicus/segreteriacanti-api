import { StatusCodes } from 'http-status-codes';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import type { PrismaModelName, PrismaWhereType } from '../../types/prisma';

/**
 * add a boolean condition to a prisma `where` object
 * @param whereConditions actual where condition to be decorated
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @since 1.0.0
 */
export const addBoolFilterToWhereConditions = <T extends PrismaModelName>(
  whereConditions: PrismaWhereType<T>,
  filterValue: string | string[],
  modelProperty: string,
  filterName?: string
): PrismaWhereType<T> => {
  filterName = filterName ?? modelProperty;

  if (Array.isArray(filterValue)) {
    throw new BaseError('validation', `'${filterName}' cannot be array`, StatusCodes.BAD_REQUEST);
  }
  const boolCondition = filterStringToBooleanValue(filterValue);
  whereConditions = {
    ...whereConditions,
    [modelProperty]: boolCondition ? { not: null } : null,
  };
  return whereConditions;
};

/**
 * add a 'isIn'/'isNotIn' boolean condition to a prisma `where` object
 * @param whereConditions actual where condition to be decorated
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @todo provide usefull type
 */
export const addBoolIsNullToWhereConditions = <T extends PrismaModelName>(
  whereConditions: PrismaWhereType<T>,
  filterValue: string | string[],
  modelProperty: string,
  filterName?: string
): PrismaWhereType<T> => {
  filterName = filterName ?? modelProperty;

  if (Array.isArray(filterValue)) {
    throw new BaseError('validation', `'${filterName}' cannot be array`, StatusCodes.BAD_REQUEST);
  }
  const _boolVal = filterStringToBooleanValue(filterValue);
  whereConditions = {
    ...whereConditions,
    [modelProperty]: _boolVal ? { is: null } : { isNot: null },
  };
  return whereConditions;
};

/**
 * @since 1.0.0
 */
export const filterStringToBooleanValue = (filterValue: string): boolean => {
  return config.application.findFilters.booleans.includes(filterValue.toLowerCase());
};

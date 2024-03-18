import type { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import type { PrismaModelName, PrismaWhereAndTypeArrayOnly, PrismaWhereOrType, PrismaWhereType } from '../../types/prisma';
import { checkAndOrOperator, createOrAppendAndConditions, createOrAppendOrConditions } from './_utils';

/**
 * add a string condition to a prisma `where` object. Both single string and string array are accepted.
 * String array is handled as:
 * > every string is threated as with an `OR` clause
 * @param whereConditions actual where condition to be decorated
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @since 1.0.0
 */
export const addNumberFilterToWhereConditions = <T extends PrismaModelName>(
  whereConditions: PrismaWhereType<T>,
  filterValue: string | string[],
  modelProperty: string,
  filterName?: string
): PrismaWhereType<T> => {
  filterName = filterName ?? modelProperty;

  if (Array.isArray(filterValue)) {
    // check if where conditions are put in "AND" or in "OR"
    const andCondition = checkAndOrOperator(filterValue, filterName);

    // compute conditions
    const whereConditionArray = _numberFilterArrayToPrismaWhereArray(filterValue, modelProperty, filterName);

    // join computed conditions
    if (andCondition) {
      whereConditions = createOrAppendAndConditions(whereConditions, whereConditionArray as PrismaWhereAndTypeArrayOnly<T>);
    } else {
      whereConditions = createOrAppendOrConditions(whereConditions, whereConditionArray);
    }
  } else {
    whereConditions = {
      ...whereConditions,
      property: stringToNumberFilter(filterValue, modelProperty, filterName),
    };
  }
  return whereConditions;
};

/**
 * check for condition modifiers contained in the string
 * - greater [equal] than
 * - less [equal] than
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @since 1.0.0
 * @todo add "not" (implies recursion)
 * @todo support float filter
 */
export const stringToNumberFilter = <T extends PrismaModelName>(
  filterValue: string,
  modelProperty: string,
  filterName?: string
): Prisma.IntFilter<T> | number => {
  filterName = filterName ?? modelProperty;

  let parsedFilter: Prisma.IntFilter<T> | number;

  let numberedFilterValue: number;

  if (filterValue.startsWith(config.application.findFilters.operators.numberGreater)) {
    filterValue = filterValue.substring(config.application.findFilters.operators.numberGreater.length);
    numberedFilterValue = Number(filterValue);
    if (Number.isNaN(numberedFilterValue)) {
      throw new BaseError('validation', `'${filterName}' is not a number`, StatusCodes.BAD_REQUEST);
    }
    parsedFilter = {
      gt: numberedFilterValue,
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberGreaterEqual)) {
    filterValue = filterValue.substring(config.application.findFilters.operators.numberGreaterEqual.length);
    numberedFilterValue = Number(filterValue);
    if (Number.isNaN(numberedFilterValue)) {
      throw new BaseError('validation', `'${filterName}' is not a number`, StatusCodes.BAD_REQUEST);
    }
    parsedFilter = {
      gte: numberedFilterValue,
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberLess)) {
    filterValue = filterValue.substring(config.application.findFilters.operators.numberLess.length);
    numberedFilterValue = Number(filterValue);
    if (Number.isNaN(numberedFilterValue)) {
      throw new BaseError('validation', `'${filterName}' is not a number`, StatusCodes.BAD_REQUEST);
    }
    parsedFilter = {
      gt: numberedFilterValue,
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberLessEqual)) {
    filterValue = filterValue.substring(config.application.findFilters.operators.numberLessEqual.length);
    numberedFilterValue = Number(filterValue);
    if (Number.isNaN(numberedFilterValue)) {
      throw new BaseError('validation', `'${filterName}' is not a number`, StatusCodes.BAD_REQUEST);
    }
    parsedFilter = {
      gte: numberedFilterValue,
    };
  } else {
    numberedFilterValue = Number(filterValue);
    if (Number.isNaN(numberedFilterValue)) {
      throw new BaseError('validation', `'${filterName}' is not a number`, StatusCodes.BAD_REQUEST);
    }
    parsedFilter = numberedFilterValue;
  }

  return parsedFilter;
};

/**
 * Morph an array of string filters to a prisma array of object that is `OR` or `AND` compatible
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @since 1.0.0
 */
const _numberFilterArrayToPrismaWhereArray = <T extends PrismaModelName>(
  filterValuesArray: string[],
  modelProperty: string,
  filterName?: string
): PrismaWhereOrType<T> | PrismaWhereAndTypeArrayOnly<T> => {
  filterName = filterName ?? modelProperty;
  return filterValuesArray.map((_value) => {
    return {
      [modelProperty]: stringToNumberFilter(_value, modelProperty, filterName),
    };
  });
};

import type { Prisma } from '@prisma/client';

import { config } from '../../config';
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
export const addStringFilterToWhereConditions = <T extends PrismaModelName>(
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
    const whereConditionArray = _stringFilterArrayToPrismaWhereArray(filterValue, modelProperty);

    // join computed conditions
    if (andCondition) {
      whereConditions = createOrAppendAndConditions(whereConditions, whereConditionArray as PrismaWhereAndTypeArrayOnly<T>);
    } else {
      whereConditions = createOrAppendOrConditions(whereConditions, whereConditionArray);
    }
  } else {
    whereConditions = {
      ...whereConditions,
      property: stringToStringFilter(filterValue),
    };
  }
  return whereConditions;
};

/**
 * Morph an array of string filters to a prisma array of object that is `OR` or `AND` compatible
 * @since 1.0.0
 */
const _stringFilterArrayToPrismaWhereArray = <T extends PrismaModelName>(
  filterValuesArray: string[],
  modelProperty: string
): PrismaWhereOrType<T> | PrismaWhereAndTypeArrayOnly<T> => {
  return filterValuesArray.map((_value) => {
    return {
      [modelProperty]: stringToStringFilter(_value),
    };
  });
};

/**
 * check for condition modifiers contained in the string
 * - starts with
 * - ends with
 * - contains
 * @since 1.0.0
 * @todo add "not" (implies recursion)
 */
export const stringToStringFilter = <T extends PrismaModelName>(filterValue: string): Prisma.StringFilter<T> | string => {
  let parsedFilter: Prisma.StringFilter<T> | string;

  if (filterValue.startsWith(config.application.findFilters.operators.stringStartsWith)) {
    parsedFilter = {
      startsWith: filterValue.substring(config.application.findFilters.operators.stringStartsWith.length),
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.stringEndsWith)) {
    parsedFilter = {
      endsWith: filterValue.substring(config.application.findFilters.operators.stringEndsWith.length),
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.stringContains)) {
    parsedFilter = {
      contains: filterValue.substring(config.application.findFilters.operators.stringContains.length),
    };
  } else {
    parsedFilter = filterValue;
  }

  return parsedFilter;
};

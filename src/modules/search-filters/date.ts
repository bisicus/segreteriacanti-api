import type { Prisma } from '@prisma/client';

import { config } from '../../config';
import type { PrismaModelName, PrismaWhereAndTypeArrayOnly, PrismaWhereOrType, PrismaWhereType } from '../../types/prisma';
import { checkAndOrOperator, createOrAppendAndConditions, createOrAppendOrConditions } from './_utils';

export const addDateFilterToWhereConditions = <T extends PrismaModelName>(
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
    const whereConditionArray = _dateFilterArrayToPrismaWhereArray(filterValue, modelProperty, filterName);

    // join computed conditions
    if (andCondition) {
      whereConditions = createOrAppendAndConditions(whereConditions, whereConditionArray as PrismaWhereAndTypeArrayOnly<T>);
    } else {
      whereConditions = createOrAppendOrConditions(whereConditions, whereConditionArray);
    }
  } else {
    whereConditions = {
      ...whereConditions,
      property: stringToDateFilter(filterValue, modelProperty, filterName),
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
 * @todo validate string to date
 */
export const stringToDateFilter = <T extends PrismaModelName>(
  filterValue: string,
  modelProperty: string,
  filterName?: string
): Prisma.DateTimeFilter<T> | string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterName = filterName ?? modelProperty;

  let parsedFilter: Prisma.DateTimeFilter<T> | string;

  if (filterValue.startsWith(config.application.findFilters.operators.numberGreater)) {
    parsedFilter = {
      gt: filterValue.substring(config.application.findFilters.operators.numberGreater.length),
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberGreaterEqual)) {
    parsedFilter = {
      gte: filterValue.substring(config.application.findFilters.operators.numberGreaterEqual.length),
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberLess)) {
    parsedFilter = {
      gt: filterValue.substring(config.application.findFilters.operators.numberLess.length),
    };
  } else if (filterValue.startsWith(config.application.findFilters.operators.numberLessEqual)) {
    parsedFilter = {
      gte: filterValue.substring(config.application.findFilters.operators.numberLessEqual.length),
    };
  } else {
    parsedFilter = filterValue;
  }

  return parsedFilter;
};

/**
 * Morph an array of string filters to a prisma array of object that is `OR` or `AND` compatible
 * @param modelProperty property of the model the "where condition" is applied to
 * @param filterName property corresponding the filters are extracted from. If missing, inferred from `modelProperty`
 * @since 1.0.0
 */
const _dateFilterArrayToPrismaWhereArray = <T extends PrismaModelName>(
  filterValuesArray: string[],
  modelProperty: string,
  filterName?: string
): PrismaWhereOrType<T> | PrismaWhereAndTypeArrayOnly<T> => {
  filterName = filterName ?? modelProperty;
  return filterValuesArray.map((_value) => {
    return {
      [modelProperty]: stringToDateFilter(_value, modelProperty, filterName),
    };
  });
};

import { config } from '../../config';

/**
 * Check if the operator to match all conditions is contained within the array of filters
 * @since 1.0.0
 */
export const checkOperatorMatchAllConditions = (filterValues: string[]): boolean => {
  let matchAllConditions = false;

  const operatorIdx = filterValues.findIndex((_) => _ === config.application.findFilters.operators.arrayMatchAllConditions);
  if (operatorIdx > -1) {
    matchAllConditions = true;
    filterValues.splice(operatorIdx, 1);
  }

  return matchAllConditions;
};

/**
 * Check if the operator to match all conditions is contained within the array of filters
 * @since 1.0.0
 */
export const checkOperatorNotIn = (filterValues: string[]): boolean => {
  let notIn = false;

  const operatorIdx = filterValues.findIndex((_) => _ === config.application.findFilters.operators.arrayNotIn);
  if (operatorIdx > -1) {
    notIn = true;
    filterValues.splice(operatorIdx, 1);
  }

  return notIn;
};

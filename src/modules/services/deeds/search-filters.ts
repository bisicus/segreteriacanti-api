import type { Prisma } from '@prisma/client';

import { addDateFilterToWhereConditions, addNumberFilterToWhereConditions, addStringFilterToWhereConditions } from '../../search-filters';

/**
 * @since 1.0.0
 * @todo 'some' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.DeedWhereInput => {
  const filters: Prisma.DeedWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Deed'>(filters, filterValue, property);
    }
    // STRING
    else if (['type'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Deed'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Deed'>(filters, filterValue, property);
    }
    // related models
    else if (property === 'has_recordings') {
      filters = {
        ...filters,
        recordings: {
          some: {},
        },
      };
    }
    return filters;
  }, {} as Prisma.DeedWhereInput);

  return filters;
};

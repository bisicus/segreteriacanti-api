import type { Prisma } from '@prisma/client';

import { addDateFilterToWhereConditions, addNumberFilterToWhereConditions, addStringFilterToWhereConditions } from '../../search-filters';

/**
 * @since 1.0.0
 * @todo 'some' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.EventWhereInput => {
  const filters: Prisma.EventWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Event'>(filters, filterValue, property);
    }
    // STRING
    else if (['name'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Event'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['startDate', 'endDate', 'createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Event'>(filters, filterValue, property);
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
  }, {} as Prisma.EventWhereInput);

  return filters;
};

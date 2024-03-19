import type { Prisma } from '@prisma/client';

import { addDateFilterToWhereConditions, addNumberFilterToWhereConditions, addStringFilterToWhereConditions } from '../../search-filters';

/**
 * @since 1.0.0
 * @todo 'some' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.MomentWhereInput => {
  const filters: Prisma.MomentWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Moment'>(filters, filterValue, property);
    }
    // STRING
    else if (['occurredOn'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Moment'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Moment'>(filters, filterValue, property);
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
  }, {} as Prisma.MomentWhereInput);

  return filters;
};

import type { Prisma } from '@prisma/client';

import { addDateFilterToWhereConditions, addNumberFilterToWhereConditions, addStringFilterToWhereConditions } from '../../search-filters';

/**
 * @since 1.0.0
 * @todo 'some' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.AuthorWhereInput => {
  const filters: Prisma.AuthorWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Author'>(filters, filterValue, property);
    }
    // STRING
    else if (['name'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Author'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Author'>(filters, filterValue, property);
    }
    // related models
    else if (property === 'has_song') {
      filters = {
        ...filters,
        songs: {
          some: {},
        },
      };
    }
    return filters;
  }, {} as Prisma.AuthorWhereInput);

  return filters;
};

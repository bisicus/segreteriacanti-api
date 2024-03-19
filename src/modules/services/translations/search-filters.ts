import type { Prisma } from '@prisma/client';

import {
  addBoolFilterToWhereConditions,
  addDateFilterToWhereConditions,
  addNumberFilterToWhereConditions,
  addStringFilterToWhereConditions,
} from '../../search-filters';

/**
 * @since 1.0.0
 * @todo 'isNot' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.TranslationWhereInput => {
  const filters: Prisma.TranslationWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Translation'>(filters, filterValue, property);
    }
    // STRING
    else if (['language'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Translation'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Translation'>(filters, filterValue, property);
    }
    // BOOL
    else if (property === 'has_text') {
      filters = addBoolFilterToWhereConditions<'Translation'>(filters, filterValue, 'refText', 'has_text');
    }
    // related models
    else if (property === 'has_song') {
      filters = {
        ...filters,
        song: {
          isNot: null,
        },
      };
    }
    return filters;
  }, {} as Prisma.TranslationWhereInput);

  return filters;
};

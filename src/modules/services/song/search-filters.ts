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
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.SongWhereInput => {
  const filters: Prisma.SongWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Song'>(filters, filterValue, property);
    }
    // STRING
    else if (['title'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Song'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Song'>(filters, filterValue, property);
    }
    // BOOL
    else if (property === 'has_lyrics') {
      filters = addBoolFilterToWhereConditions<'Song'>(filters, filterValue, 'refLyrics', 'has_lyrics');
    } else if (property === 'has_score') {
      filters = addBoolFilterToWhereConditions<'Song'>(filters, filterValue, 'refScore', 'has_score');
    } else if (property === 'has_tablatures') {
      filters = addBoolFilterToWhereConditions<'Song'>(filters, filterValue, 'refTablature', 'has_tablatures');
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
  }, {} as Prisma.SongWhereInput);

  return filters;
};

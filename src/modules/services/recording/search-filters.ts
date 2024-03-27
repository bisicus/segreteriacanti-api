import type { Prisma } from '@prisma/client';

import { addDateFilterToWhereConditions, addNumberFilterToWhereConditions, addStringFilterToWhereConditions } from '../../search-filters';
import {
  addAuthorIdToWhereConditions as song_addAuthorIdToWhereConditions,
  addAuthorNameToWhereConditions as song_addAuthorNameToWhereConditions,
} from '../song/search-filters';

/**
 * @since 1.0.0
 * @todo 'isNot' on related models can be aggregated into function
 */
export const parseSearchFilters = (input: Record<string, string | string[]>): Prisma.RecordingWhereInput => {
  const filters: Prisma.RecordingWhereInput = Object.entries(input).reduce((filters, [property, filterValue]) => {
    property = property.toLowerCase();
    // NUMBER
    if (['id'].includes(property)) {
      filters = addNumberFilterToWhereConditions<'Recording'>(filters, filterValue, property);
    }
    // STRING
    else if (['comment'].includes(property)) {
      filters = addStringFilterToWhereConditions<'Recording'>(filters, filterValue, property);
    }
    // DATETIME
    else if (['createdAt', 'updatedAt'].includes(property)) {
      filters = addDateFilterToWhereConditions<'Recording'>(filters, filterValue, property);
    }
    // related models
    else if (property === 'has_deed') {
      filters = {
        ...filters,
        deed: {
          isNot: null,
        },
      };
    } else if (property === 'has_event') {
      filters = {
        ...filters,
        event: {
          isNot: null,
        },
      };
    } else if (property === 'has_moment') {
      filters = {
        ...filters,
        moment: {
          isNot: null,
        },
      };
    } else if (property === 'has_song') {
      filters = {
        ...filters,
        song: {
          isNot: null,
        },
      };
    } else if (['author', 'author_id'].includes(property)) {
      filters = addAuthorIdToWhereConditions(filters, filterValue);
    } else if (property === 'author_name') {
      filters = addAuthorNameToWhereConditions(filters, filterValue);
    }
    return filters;
  }, {} as Prisma.RecordingWhereInput);

  return filters;
};

export const addAuthorIdToWhereConditions = (filters: Prisma.RecordingWhereInput, filterValue: string | string[]): Prisma.RecordingWhereInput => {
  let filterToAdd: Prisma.SongWhereInput = {};
  filterToAdd = song_addAuthorIdToWhereConditions(filterToAdd, filterValue);

  filters = {
    ...filters,
    song: filterToAdd,
  };

  return filters;
};

export const addAuthorNameToWhereConditions = (filters: Prisma.RecordingWhereInput, filterValue: string | string[]): Prisma.RecordingWhereInput => {
  let filterToAdd: Prisma.SongWhereInput = {};
  filterToAdd = song_addAuthorNameToWhereConditions(filterToAdd, filterValue);

  filters = {
    ...filters,
    song: filterToAdd,
  };

  return filters;
};

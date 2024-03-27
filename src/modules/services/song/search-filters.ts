import type { Prisma } from '@prisma/client';

import {
  addBoolFilterToWhereConditions,
  addDateFilterToWhereConditions,
  addNumberFilterToWhereConditions,
  addStringFilterToWhereConditions,
  checkOperatorIsIn,
  checkOperatorMatchAllConditions,
  stringToNumberFilter,
  stringToStringFilter,
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
    // related models
    else if (['author', 'author_id'].includes(property)) {
      filters = addAuthorIdToWhereConditions(filters, filterValue);
    } else if (property === 'author_name') {
      filters = addAuthorNameToWhereConditions(filters, filterValue);
    } else if (property === 'translation') {
      filters = addTranslationToWhereConditions(filters, filterValue);
    }
    return filters;
  }, {} as Prisma.SongWhereInput);

  return filters;
};

//////////////////////////////
/////   RELATED MODELS   /////
//////////////////////////////

//  AUTHORS
/**
 * @since 1.0.0
 * @todo 'in/notIn' & 'every/some' can become a common function
 */
export const addAuthorIdToWhereConditions = (filters: Prisma.SongWhereInput, filterValue: string | string[]): Prisma.SongWhereInput => {
  let filterToAdd: Prisma.SongWhereInput;

  if (Array.isArray(filterValue) === false) {
    filterToAdd = {
      authors: {
        some: {
          id: stringToNumberFilter<'Author'>(filterValue, 'id', 'author'),
        },
      },
    };
  } else {
    const operatorIsIn: 'in' | 'notIn' = checkOperatorIsIn(filterValue) ? 'in' : 'notIn';
    const operatorEvery: keyof Prisma.TranslationListRelationFilter = checkOperatorMatchAllConditions(filterValue) ? 'every' : 'some';

    const numberifiedFilterValues = filterValue.map(Number);

    filterToAdd = {
      translation: {
        [operatorEvery]: {
          id: {
            [operatorIsIn]: numberifiedFilterValues,
          },
        } as Prisma.TranslationWhereInput,
      },
    };
  }

  filters = { ...filters, ...filterToAdd };
  return filters;
};

/**
 * @since 1.0.0
 * @todo 'in/notIn' & 'every/some' can become a common function
 */
export const addAuthorNameToWhereConditions = (filters: Prisma.SongWhereInput, filterValue: string | string[]): Prisma.SongWhereInput => {
  let filterToAdd: Prisma.SongWhereInput;

  if (Array.isArray(filterValue) === false) {
    filterToAdd = {
      authors: {
        some: {
          name: stringToStringFilter<'Author'>(filterValue),
        },
      },
    };
    filters = { ...filters, ...filterToAdd };
  } else {
    filters = addStringFilterToWhereConditions<'Song'>(filters, filterValue, 'authors', 'author_name');
  }

  return filters;
};

//  TRANSLATION
/**
 * @since 1.0.0
 */
const addTranslationToWhereConditions = (filters: Prisma.SongWhereInput, filterValue: string | string[]): Prisma.SongWhereInput => {
  let filterToAdd: Prisma.SongWhereInput;

  if (Array.isArray(filterValue) === false) {
    // single sting --> '===' filter
    filterToAdd = {
      translation: {
        some: {
          language: filterValue,
        },
      },
    };
  } else {
    const operatorIsIn: 'in' | 'notIn' = checkOperatorIsIn(filterValue) ? 'in' : 'notIn';
    const operatorEvery: keyof Prisma.TranslationListRelationFilter = checkOperatorMatchAllConditions(filterValue) ? 'every' : 'some';

    filterToAdd = {
      translation: {
        [operatorEvery]: {
          language: {
            [operatorIsIn]: filterValue,
          },
        } as Prisma.TranslationWhereInput,
      },
    };
  }

  filters = {
    ...filters,
    ...filterToAdd,
  };
  return filters;
};

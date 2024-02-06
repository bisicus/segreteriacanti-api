import iso639_1Languages from './language-map.json';

/**
 * @since 1.0.0
 */
const LANGUAGES_MAP: Map<string, string> = new Map(
  Object.entries(iso639_1Languages).flatMap(([isoCode, allowedAliases]): [string, string][] => {
    return [[isoCode, isoCode] as [string, string], ...allowedAliases.map((alias): [string, string] => [isoCode, alias])];
  })
);

/**
 * retrieve an ISO 639-1 language from a possible alias
 * @example
 * getIso639_1('en');       // --> 'en'
 * getIso639_1('french');   // --> 'fr'
 * getIso639_1('german');   // --> 'de'
 * getIso639_1('ita');      // --> 'it'
 * getIso639_1('por');      // --> 'pt'
 * getIso639_1('spagnolo'); // --> 'es'
 * @see {@link https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes}
 * @since 1.0.0
 */
export const getIso639_1 = (language: unknown): string | null => {
  let iso639_1: string | null = null;
  if (typeof language === 'string') {
    iso639_1 = LANGUAGES_MAP.get(language.toLowerCase()) ?? null;
  }
  return iso639_1;
};

import type { Author, Deed, Event, Moment, Recording } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { db } from '../db';
import logger from '../logger';

/**
 * @since 1.0.0
 */
export type RecordImport = {
  autori: string[];
  eventoNome: string;
  eventoInizio?: string;
  eventoFine?: string;
  gesto: string;
  momento: string;
  titolo: string;
  valutazione: string;
  commento?: string;
};

/**
 * Flusso
 * ------
 * 1. se non esiste crea 'canto', con relativi 'autore'
 * 2. se non esistono, crea 'evento', 'momento', 'gesto'
 * 3. crea registrazione e associala alle entità precedenti
 *
 * Note
 * ----
 * - Assunzione 1: se un canto è già stato creato, allora anche i suoi autori già esistono
 * @since 1.0.0
 * @todo si può ottimizzare con `createMany`
 * @todo TRANSAZIONI
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 * @todo validazione: può essere che la registrazione già esista; trovare un modo per sgamare i duplicati
 * @todo wrapper per PrismaError
 */
export const importRecords = async (importDescriptor: RecordImport[]) => {
  try {
    // MAIN VARIABLES
    const recordings: Recording[] = [];

    // ----- PRELIMINARI ----- //
    const { DbAuthors, DbDeeds, DbEvents, DbMoments, DbSongs } = await _fetchImportExistentResources(importDescriptor);

    // ----- CREAZIONE RISORSE A PARTIRE DALL'IMPORT REGISTRAZIONI ----- //
    for (const importRow of importDescriptor) {
      // CANTO E AUTORI
      let relatedDbSong = DbSongs.find((_c) => _c.title === importRow.titolo);
      if (relatedDbSong) {
        logger.debug({ titolo: importRow.titolo }, 'canto già esistente, verrà relazionato alla registrazione');
      } else {
        logger.info({ titolo: importRow.titolo }, 'creazione canto');

        // cerca tra gli autori ed eventualmente creali
        const authorsToRelate: Author[] = [];
        for (const authorNeedle of importRow.autori) {
          const _relatedDbAuthor = DbAuthors.find((_a) => _a.name === authorNeedle);

          if (_relatedDbAuthor) {
            logger.debug({ autore: authorNeedle, titolo: importRow.titolo }, 'autore già esistente, verrà relazionato al canto');
            authorsToRelate.push(_relatedDbAuthor);
          } else {
            logger.debug({ autore: authorNeedle }, 'creazione autore');
            const _newAuthor = await db.author.create({
              data: {
                name: authorNeedle,
                createdBy: -1,
                updatedBy: -1,
              },
            });
            logger.info({ nome: _newAuthor.name, id: _newAuthor.id }, 'CREATE: autore');
            authorsToRelate.push(_newAuthor);

            // il nuovo autore potrebbe essere utile per successivi import. Evito una nuova query
            logger.debug({ autore: authorNeedle }, 'aggiungo autore alla lista dei presenti del DB');
            DbAuthors.push(_newAuthor);
          }
        }

        // creazione canto
        relatedDbSong = await db.song.create({
          data: {
            title: importRow.titolo,
            authors: {
              connect: authorsToRelate,
            },
          },
        });
        logger.info({ nome: relatedDbSong.title, id: relatedDbSong.id }, 'CREATE: canto');
      }

      // EVENTO, GESTO, MOMENTO
      const [deed, event, moment] = await Promise.all([
        _findOrCreateDeed(importRow, DbDeeds),
        _findOrCreateEvent(importRow, DbEvents),
        _findOrCreateMoment(importRow, DbMoments),
      ]);

      // REGISTRAZIONE
      logger.debug({ titolo: importRow.titolo }, 'creazione registrazione per canto');
      const newRecording = await db.recording.create({
        data: {
          comment: importRow.commento ?? null,
          evaluation: importRow.valutazione,
          song: {
            connect: relatedDbSong,
          },
          event: {
            connect: event,
          },
          deed: {
            connect: deed,
          },
          moment: {
            connect: moment,
          },
          createdBy: -1,
          updatedBy: -1,
        },
      });
      logger.info({ id: newRecording.id }, 'CREATE: registrazione');

      recordings.push(newRecording);
    }

    return recordings;
  } catch (err) {
    if (err instanceof PrismaClientValidationError) {
      throw new BaseError(err.name, err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    } else if (err instanceof Error) {
      throw new BaseError(err.name, err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    } else {
      throw err;
    }
  }
};

/**
 * Cerca nel DB tutte le risorse che già esistono per questo import
 * @since 1.0.0
 * @todo supportare 'gesto', 'evento', 'momento' come `null` o stringa vuota
 * @todo valutare sostituzione 'in' clause con 'in like' clause
 */
const _fetchImportExistentResources = async (importDescriptor: RecordImport[]) => {
  const importAuthors = [...new Set(importDescriptor.flatMap((record) => record.autori))];
  const importDeeds = [...new Set(importDescriptor.map((record) => record.gesto))];
  const importEvents = [...new Set(importDescriptor.map((record) => record.eventoNome))];
  const importMoments = [...new Set(importDescriptor.map((record) => record.momento))];
  const importSongs = importDescriptor.map((record) => record.titolo);

  const [DbAuthors, DbDeeds, DbEvents, DbMoments, DbSongs] = await Promise.all([
    // cerca autori già caricati
    db.author.findMany({
      where: {
        name: {
          in: importAuthors,
        },
      },
    }),
    // cerca gesti già caricati
    db.deed.findMany({
      where: {
        type: {
          in: importDeeds,
        },
      },
    }),
    // cerca eventi già caricati
    db.event.findMany({
      where: {
        name: {
          in: importEvents,
        },
      },
    }),
    // cerca momenti già caricati
    db.moment.findMany({
      where: {
        occurredOn: {
          in: importMoments,
        },
      },
    }),
    // cerca canti già caricati
    db.song.findMany({
      where: {
        title: {
          in: importSongs,
        },
      },
    }),
  ]);

  return {
    DbAuthors,
    DbDeeds,
    DbEvents,
    DbMoments,
    DbSongs,
  };
};

/**
 * Cerca un "evento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 * @todo valutare se eventoInizio e eventoFine possono essere opzionali nel modello
 */
const _findOrCreateEvent = async (importRow: RecordImport, DbEvents: Event[]) => {
  let relatedDbEvent = DbEvents.find((_e) => _e.name === importRow.eventoNome);
  if (relatedDbEvent) {
    logger.debug({ titolo: importRow.titolo }, 'evento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione evento
    logger.debug({ titolo: importRow.titolo }, 'creazione evento');
    relatedDbEvent = await db.event.create({
      data: {
        name: importRow.eventoNome,
        startDate: importRow.eventoInizio ? new Date(importRow.eventoInizio) : new Date(),
        endDate: importRow.eventoFine ? new Date(importRow.eventoFine) : new Date(),
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ nome: relatedDbEvent.name, id: relatedDbEvent.id }, 'CREATE: evento');

    logger.debug({ autore: relatedDbEvent.name }, 'aggiungo autore alla lista dei presenti del DB');
    DbEvents.push(relatedDbEvent);
  }

  return relatedDbEvent;
};

/**
 * Cerca un "gesto" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 */
const _findOrCreateDeed = async (importRow: RecordImport, DbDeeds: Deed[]) => {
  let relatedDbDeed = DbDeeds.find((_g) => _g.type === importRow.gesto);
  if (relatedDbDeed) {
    logger.debug({ titolo: importRow.titolo }, 'evento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione evento
    logger.debug({ titolo: importRow.titolo }, 'creazione evento');
    relatedDbDeed = await db.deed.create({
      data: {
        type: importRow.gesto,
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ tipo: relatedDbDeed.type, id: relatedDbDeed.id }, 'CREATE: evento');

    logger.debug({ titolo: importRow.titolo }, 'aggiungo autore alla lista dei presenti del DB');
    DbDeeds.push(relatedDbDeed);
  }

  return relatedDbDeed;
};

/**
 * Cerca un "momento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 */
const _findOrCreateMoment = async (importRow: RecordImport, DbMoments: Moment[]) => {
  let relatedDbMoment = DbMoments.find((_m) => _m.occurredOn === importRow.momento);
  if (relatedDbMoment) {
    logger.debug({ titolo: importRow.titolo }, 'momento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione momento
    logger.debug({ titolo: importRow.titolo }, 'creazione momento');
    relatedDbMoment = await db.moment.create({
      data: {
        occurredOn: importRow.momento,
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ quando: relatedDbMoment.occurredOn, id: relatedDbMoment.id }, 'CREATE: momento');

    logger.debug({ titolo: importRow.titolo }, 'aggiungo autore alla lista dei presenti del DB');
    DbMoments.push(relatedDbMoment);
  }
  return relatedDbMoment;
};

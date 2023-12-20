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
    const registrazioni: Recording[] = [];

    // ----- PRELIMINARI ----- //
    const { DBCanti, DBAutori, DBEventi, DBGesti, DBMomenti } = await _fetchImportExistentResources(importDescriptor);

    // ----- CREAZIONE RISORSE A PARTIRE DALL'IMPORT REGISTRAZIONI ----- //
    for (const importRow of importDescriptor) {
      // CANTO E AUTORI
      let relatedDbCanto = DBCanti.find((_c) => _c.title === importRow.titolo);
      if (relatedDbCanto) {
        logger.debug({ titolo: importRow.titolo }, 'canto già esistente, verrà relazionato alla registrazione');
      } else {
        logger.info({ titolo: importRow.titolo }, 'creazione canto');

        // cerca tra gli autori ed eventualmente creali
        const autoriDaRelazionare: Author[] = [];
        for (const autoreNeedle of importRow.autori) {
          const _relatedDbAutore = DBAutori.find((_a) => _a.name === autoreNeedle);

          if (_relatedDbAutore) {
            logger.debug({ autore: autoreNeedle, titolo: importRow.titolo }, 'autore già esistente, verrà relazionato al canto');
            autoriDaRelazionare.push(_relatedDbAutore);
          } else {
            logger.debug({ autore: autoreNeedle }, 'creazione autore');
            const _newAutore = await db.author.create({
              data: {
                name: autoreNeedle,
                createdBy: -1,
                updatedBy: -1,
              },
            });
            logger.info({ nome: _newAutore.name, id: _newAutore.id }, 'CREATE: autore');
            autoriDaRelazionare.push(_newAutore);

            // il nuovo autore potrebbe essere utile per successivi import. Evito una nuova query
            logger.debug({ autore: autoreNeedle }, 'aggiungo autore alla lista dei presenti del DB');
            DBAutori.push(_newAutore);
          }
        }

        // creazione canto
        relatedDbCanto = await db.song.create({
          data: {
            title: importRow.titolo,
            authors: {
              connect: autoriDaRelazionare,
            },
          },
        });
        logger.info({ nome: relatedDbCanto.title, id: relatedDbCanto.id }, 'CREATE: canto');
      }

      // EVENTO, GESTO, MOMENTO
      const [evento, gesto, momento] = await Promise.all([
        _findOrCreateEvento(importRow, DBEventi),
        _findOrCreateGesto(importRow, DBGesti),
        _findOrCreateMomento(importRow, DBMomenti),
      ]);

      // REGISTRAZIONE
      logger.debug({ titolo: importRow.titolo }, 'creazione registrazione per canto');
      const newRegistrazione = await db.recording.create({
        data: {
          comment: importRow.commento ?? null,
          evaluation: importRow.valutazione,
          song: {
            connect: relatedDbCanto,
          },
          event: {
            connect: evento,
          },
          deed: {
            connect: gesto,
          },
          moment: {
            connect: momento,
          },
          createdBy: -1,
          updatedBy: -1,
        },
      });
      logger.info({ id: newRegistrazione.id }, 'CREATE: registrazione');

      registrazioni.push(newRegistrazione);
    }

    return registrazioni;
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
  const importAutori = [...new Set(importDescriptor.flatMap((record) => record.autori))];
  const importCanti = importDescriptor.map((record) => record.titolo);
  const importGesti = [...new Set(importDescriptor.map((record) => record.gesto))];
  const importEventi = [...new Set(importDescriptor.map((record) => record.eventoNome))];
  const importMomenti = [...new Set(importDescriptor.map((record) => record.momento))];

  const [DBAutori, DBCanti, DBEventi, DBGesti, DBMomenti] = await Promise.all([
    // cerca autori già caricati
    db.author.findMany({
      where: {
        name: {
          in: importAutori,
        },
      },
    }),
    // cerca canti già caricati
    db.song.findMany({
      where: {
        title: {
          in: importCanti,
        },
      },
    }),
    // cerca eventi già caricati
    db.event.findMany({
      where: {
        name: {
          in: importEventi,
        },
      },
    }),
    // cerca gesti già caricati
    db.deed.findMany({
      where: {
        type: {
          in: importGesti,
        },
      },
    }),
    // cerca momenti già caricati
    db.moment.findMany({
      where: {
        occurredOn: {
          in: importMomenti,
        },
      },
    }),
  ]);

  return {
    DBAutori,
    DBCanti,
    DBEventi,
    DBGesti,
    DBMomenti,
  };
};

/**
 * Cerca un "evento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 * @todo valutare se eventoInizio e eventoFine possono essere opzionali nel modello
 */
const _findOrCreateEvento = async (importRow: RecordImport, DBEventi: Event[]) => {
  let relatedDbEvento = DBEventi.find((_e) => _e.name === importRow.eventoNome);
  if (relatedDbEvento) {
    logger.debug({ titolo: importRow.titolo }, 'evento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione evento
    logger.debug({ titolo: importRow.titolo }, 'creazione evento');
    relatedDbEvento = await db.event.create({
      data: {
        name: importRow.eventoNome,
        startDate: importRow.eventoInizio ? new Date(importRow.eventoInizio) : new Date(),
        endDate: importRow.eventoFine ? new Date(importRow.eventoFine) : new Date(),
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ nome: relatedDbEvento.name, id: relatedDbEvento.id }, 'CREATE: evento');

    logger.debug({ autore: relatedDbEvento.name }, 'aggiungo autore alla lista dei presenti del DB');
    DBEventi.push(relatedDbEvento);
  }

  return relatedDbEvento;
};

/**
 * Cerca un "gesto" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 */
const _findOrCreateGesto = async (importRow: RecordImport, DBGesti: Deed[]) => {
  let relatedDbGesto = DBGesti.find((_g) => _g.type === importRow.gesto);
  if (relatedDbGesto) {
    logger.debug({ titolo: importRow.titolo }, 'evento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione evento
    logger.debug({ titolo: importRow.titolo }, 'creazione evento');
    relatedDbGesto = await db.deed.create({
      data: {
        type: importRow.gesto,
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ tipo: relatedDbGesto.type, id: relatedDbGesto.id }, 'CREATE: evento');

    logger.debug({ titolo: importRow.titolo }, 'aggiungo autore alla lista dei presenti del DB');
    DBGesti.push(relatedDbGesto);
  }

  return relatedDbGesto;
};

/**
 * Cerca un "momento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `-1` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 */
const _findOrCreateMomento = async (importRow: RecordImport, DBMomenti: Moment[]) => {
  let relatedDbMomento = DBMomenti.find((_m) => _m.occurredOn === importRow.momento);
  if (relatedDbMomento) {
    logger.debug({ titolo: importRow.titolo }, 'momento già esistente, verrà relazionato alla registrazione');
  } else {
    // creazione momento
    logger.debug({ titolo: importRow.titolo }, 'creazione momento');
    relatedDbMomento = await db.moment.create({
      data: {
        occurredOn: importRow.momento,
        createdBy: -1,
        updatedBy: -1,
      },
    });
    logger.info({ quando: relatedDbMomento.occurredOn, id: relatedDbMomento.id }, 'CREATE: momento');

    logger.debug({ titolo: importRow.titolo }, 'aggiungo autore alla lista dei presenti del DB');
    DBMomenti.push(relatedDbMomento);
  }
  return relatedDbMomento;
};

import z from 'zod';

/**
 * @since 1.0.0
 */
const _schemaRecordImport = z.object({
  autori: z.union([z.string(), z.array(z.string())]),
  eventoNome: z.string(),
  eventoInizio: z.string().optional(),
  eventoFine: z.string().optional(),
  gesto: z.string(),
  momento: z.string(),
  titolo: z.string(),
  valutazione: z.string(),
  commento: z.string().optional(),
});

/**
 * @since 1.0.0
 */
export const schemaRecordImportList = z.array(_schemaRecordImport);

/**
 * @since 1.0.0
 */
export type SchemaRecordImport = z.infer<typeof _schemaRecordImport>;
/**
 * @since 1.0.0
 */
export type SchemaRecordImportList = z.infer<typeof schemaRecordImportList>;

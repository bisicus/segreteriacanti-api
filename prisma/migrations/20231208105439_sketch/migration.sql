BEGIN TRY BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Canto] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [nome] NVARCHAR(1000) NOT NULL,
    [ref_testo] NVARCHAR(1000),
    [ref_spartito] NVARCHAR(1000),
    [ref_accordi] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Canto_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Canto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Autore] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [nome] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Autore_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Autore_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Registrazione] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [valutazione] NVARCHAR(1000),
    [commento] NVARCHAR(1000),
    [_canto_id] INT,
    [_evento_id] INT,
    [_gesto_id] INT,
    [_momento_id] INT,
    [ref_audio] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Registrazione_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Registrazione_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Evento] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [nome] NVARCHAR(1000) NOT NULL,
    [dataInizio] DATE NOT NULL,
    [dataFine] DATE NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Evento_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Evento_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Gesto] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [tipo] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Gesto_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Gesto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Momento] (
    [id] INT NOT NULL IDENTITY(1, 1),
    [quando] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Momento_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Momento_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_AutoreToCanto] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_AutoreToCanto_AB_unique] UNIQUE NONCLUSTERED ([A], [B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_AutoreToCanto_B_index] ON [dbo].[_AutoreToCanto]([B]);

-- AddForeignKey
ALTER TABLE
    [dbo].[Registrazione]
ADD
    CONSTRAINT [Registrazione__canto_id_fkey] FOREIGN KEY ([_canto_id]) REFERENCES [dbo].[Canto]([id]) ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    [dbo].[Registrazione]
ADD
    CONSTRAINT [Registrazione__evento_id_fkey] FOREIGN KEY ([_evento_id]) REFERENCES [dbo].[Evento]([id]) ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    [dbo].[Registrazione]
ADD
    CONSTRAINT [Registrazione__gesto_id_fkey] FOREIGN KEY ([_gesto_id]) REFERENCES [dbo].[Gesto]([id]) ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    [dbo].[Registrazione]
ADD
    CONSTRAINT [Registrazione__momento_id_fkey] FOREIGN KEY ([_momento_id]) REFERENCES [dbo].[Momento]([id]) ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    [dbo].[_AutoreToCanto]
ADD
    CONSTRAINT [_AutoreToCanto_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Autore]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    [dbo].[_AutoreToCanto]
ADD
    CONSTRAINT [_AutoreToCanto_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Canto]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY BEGIN CATCH IF @ @TRANCOUNT > 0 BEGIN ROLLBACK TRAN;

END;

THROW
END CATCH
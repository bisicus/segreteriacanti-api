BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Author] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Author_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Author_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Deed] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Deed_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Deed_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Event] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [startDate] DATE NOT NULL,
    [endDate] DATE NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Event_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Event_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Moment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [occurredOn] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Moment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Moment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Recording] (
    [id] INT NOT NULL IDENTITY(1,1),
    [evaluation] NVARCHAR(1000),
    [comment] NVARCHAR(1000),
    [_deed_id] INT,
    [_event_id] INT,
    [_moment_id] INT,
    [_song_id] INT,
    [refAudio] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Recording_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Recording_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Song] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [refLyrics] NVARCHAR(1000),
    [refScore] NVARCHAR(1000),
    [refTablature] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Song_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    [createdBy] INT,
    [updatedBy] INT,
    CONSTRAINT [Song_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_AuthorToSong] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_AuthorToSong_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_AuthorToSong_B_index] ON [dbo].[_AuthorToSong]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[Recording] ADD CONSTRAINT [Recording__deed_id_fkey] FOREIGN KEY ([_deed_id]) REFERENCES [dbo].[Deed]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recording] ADD CONSTRAINT [Recording__event_id_fkey] FOREIGN KEY ([_event_id]) REFERENCES [dbo].[Event]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recording] ADD CONSTRAINT [Recording__moment_id_fkey] FOREIGN KEY ([_moment_id]) REFERENCES [dbo].[Moment]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Recording] ADD CONSTRAINT [Recording__song_id_fkey] FOREIGN KEY ([_song_id]) REFERENCES [dbo].[Song]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AuthorToSong] ADD CONSTRAINT [_AuthorToSong_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Author]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AuthorToSong] ADD CONSTRAINT [_AuthorToSong_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Song]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

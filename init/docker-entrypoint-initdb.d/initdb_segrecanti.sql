USE [master];

-- create database `segrecanti`
IF NOT EXISTS ( SELECT * FROM sys.databases WHERE name = 'segrecanti' )
BEGIN
  CREATE DATABASE [segrecanti] ON PRIMARY (
    NAME = N'segrecanti',
    FILENAME = N'/var/opt/mssql/data\segrecanti.ndf',
    SIZE = 8MB,
    MAXSIZE = UNLIMITED,
    FILEGROWTH = 64MB 
  )
  LOG ON ( 
    NAME = N'segrecanti_log',
    FILENAME = N'/var/opt/mssql/data\segrecanti_log.ldf',
    SIZE = 8MB,
    MAXSIZE = UNLIMITED,
    FILEGROWTH = 64MB
  );
END;

ALTER DATABASE [segrecanti] COLLATE Latin1_General_100_CI_AI_SC_UTF8;

-- create user `segrecanti` with CRUD on db `segrecanti`
USE [segrecanti];
IF NOT EXISTS ( SELECT * FROM sys.server_principals WHERE name = 'segrecanti' )
BEGIN
  CREATE LOGIN [segrecanti] WITH PASSWORD = 'segr&Cant1',
		CHECK_POLICY = ON,
		CHECK_EXPIRATION = OFF,
		DEFAULT_DATABASE = [segrecanti],
		DEFAULT_LANGUAGE = [English];
	
  CREATE USER [segrecanti] FOR LOGIN [segrecanti];

  -- Grand CRUD Permissions
	GRANT
		SELECT,
		INSERT,
		UPDATE,
		DELETE ON SCHEMA::dbo TO segrecanti;
END;
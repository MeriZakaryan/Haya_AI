/*
Q10_Deploy_Backup_Database

This creates a backup file.
*/

USE master;
GO

BACKUP DATABASE UniversityDB
TO DISK = 'C:\SQLBackups\UniversityDB.bak'
WITH INIT, FORMAT, NAME = 'UniversityDB Full Backup';
GO
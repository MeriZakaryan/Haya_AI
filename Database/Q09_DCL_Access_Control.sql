/*
Q09_DCL_Access_Control
This creates two logins/users:

1. UniAdminUser   -> full control on UniversityDB
2. UniReadUser    -> read-only access
*/

USE master;
GO

/* Create server logins */
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'UniAdminUser')
    CREATE LOGIN UniAdminUser WITH PASSWORD = 'Admin1234!';
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'UniReadUser')
    CREATE LOGIN UniReadUser WITH PASSWORD = 'Read1234!';
GO

/* Switch to database */
USE UniversityDB;
GO

/* Create database users */
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'UniAdminUser')
    CREATE USER UniAdminUser FOR LOGIN UniAdminUser;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'UniReadUser')
    CREATE USER UniReadUser FOR LOGIN UniReadUser;
GO

/* Grant permissions */

/* Full control to admin user */
ALTER ROLE db_owner ADD MEMBER UniAdminUser;
GO

/* Read-only user */
GRANT SELECT ON Student TO UniReadUser;
GRANT SELECT ON Faculty TO UniReadUser;
GRANT SELECT ON StudyYear TO UniReadUser;
GRANT SELECT ON [Group] TO UniReadUser;
GRANT SELECT ON Course TO UniReadUser;
GRANT SELECT ON Instructor TO UniReadUser;
GRANT SELECT ON CourseGroup TO UniReadUser;
GRANT SELECT ON Enrollment TO UniReadUser;
GRANT SELECT ON Grade TO UniReadUser;
GRANT SELECT ON StudentGroupHistory TO UniReadUser;
GRANT SELECT ON Graduation TO UniReadUser;
GO
/*
Q08_Create_Stored_Procedures
Paste this in a NEW query window.
CREATE PROCEDURE must be in its own batch, so keep this step separate.
*/

USE UniversityDB;
GO

/* Drop procedures if they already exist */
IF OBJECT_ID('sp_GetStudentTranscript', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetStudentTranscript;
GO

IF OBJECT_ID('sp_RecordGrade', 'P') IS NOT NULL
    DROP PROCEDURE sp_RecordGrade;
GO

IF OBJECT_ID('sp_AddStudentGroupHistory', 'P') IS NOT NULL
    DROP PROCEDURE sp_AddStudentGroupHistory;
GO

/* Procedure 1: Get full transcript for one student */
CREATE PROCEDURE sp_GetStudentTranscript
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.StudentID,
        s.Name,
        s.Surname,
        c.CourseName,
        cg.Semester,
        cg.AcademicYear,
        gr.GradeValue,
        gr.Comments
    FROM Student s
    JOIN Enrollment e ON s.StudentID = e.StudentID
    JOIN Grade gr ON e.EnrollmentID = gr.EnrollmentID
    JOIN CourseGroup cg ON e.CourseGroupID = cg.CourseGroupID
    JOIN Course c ON cg.CourseID = c.CourseID
    WHERE s.StudentID = @StudentID
    ORDER BY cg.AcademicYear, cg.Semester, c.CourseName;
END;
GO

/* Procedure 2: Record a grade */
CREATE PROCEDURE sp_RecordGrade
    @EnrollmentID INT,
    @GradeValue DECIMAL(4,2),
    @Comments VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Grade WHERE EnrollmentID = @EnrollmentID)
    BEGIN
        UPDATE Grade
        SET GradeValue = @GradeValue,
            Comments = @Comments
        WHERE EnrollmentID = @EnrollmentID;
    END
    ELSE
    BEGIN
        DECLARE @NewGradeID INT;
        SELECT @NewGradeID = ISNULL(MAX(GradeID), 0) + 1 FROM Grade;

        INSERT INTO Grade (GradeID, GradeValue, Comments, EnrollmentID)
        VALUES (@NewGradeID, @GradeValue, @Comments, @EnrollmentID);
    END
END;
GO

/* Procedure 3: Add student group history */
CREATE PROCEDURE sp_AddStudentGroupHistory
    @StudentID INT,
    @GroupID INT,
    @AcademicYear INT,
    @StartDate DATE,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO StudentGroupHistory (StudentID, GroupID, AcademicYear, StartDate, EndDate)
    VALUES (@StudentID, @GroupID, @AcademicYear, @StartDate, @EndDate);
END;
GO

/* Test procedures */
EXEC sp_GetStudentTranscript @StudentID = 1;
GO

EXEC sp_RecordGrade @EnrollmentID = 1, @GradeValue = 18, @Comments = 'Updated by procedure';
GO

EXEC sp_AddStudentGroupHistory
    @StudentID = 46,
    @GroupID = 10,
    @AcademicYear = 2026,
    @StartDate = '2026-09-01',
    @EndDate = '2027-06-30';
GO
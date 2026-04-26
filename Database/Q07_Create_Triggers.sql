/*
Q07_Create_Triggers

Trigger 1:
- Prevent invalid grade values (0..20) even before insert/update.
- This overlaps with CHECK constraint, but it is good for assignment demonstration.

Trigger 2:
- When a grade is inserted with NULL comment:
    grade < 10  -> "Fail"
    grade >=10 and <16 -> "Pass"
    grade >=16 -> "Very Good"
*/

USE UniversityDB;
GO

/* Drop old triggers if they exist */
IF OBJECT_ID('trg_Grade_ValidateRange', 'TR') IS NOT NULL
    DROP TRIGGER trg_Grade_ValidateRange;
GO

IF OBJECT_ID('trg_Grade_DefaultComment', 'TR') IS NOT NULL
    DROP TRIGGER trg_Grade_DefaultComment;
GO

/* Trigger 1: validate grade range */
CREATE TRIGGER trg_Grade_ValidateRange
ON Grade
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE GradeValue < 0 OR GradeValue > 20
    )
    BEGIN
        RAISERROR ('GradeValue must be between 0 and 20.', 16, 1);
        RETURN;
    END;

    INSERT INTO Grade (GradeID, GradeValue, Comments, EnrollmentID)
    SELECT GradeID, GradeValue, Comments, EnrollmentID
    FROM inserted;
END;
GO

/* Trigger 2: auto-fill comments after insert if comment is NULL */
CREATE TRIGGER trg_Grade_DefaultComment
ON Grade
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE g
    SET Comments =
        CASE
            WHEN i.GradeValue < 10 THEN 'Fail'
            WHEN i.GradeValue < 16 THEN 'Pass'
            ELSE 'Very Good'
        END
    FROM Grade g
    JOIN inserted i
        ON g.GradeID = i.GradeID
    WHERE g.Comments IS NULL;
END;
GO
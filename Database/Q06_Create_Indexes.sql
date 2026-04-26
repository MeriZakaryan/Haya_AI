/*
Q06_Create_Indexes
*/

USE UniversityDB;
GO

/* Drop existing indexes if needed */
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Enrollment_StudentID' AND object_id = OBJECT_ID('Enrollment'))
    DROP INDEX IX_Enrollment_StudentID ON Enrollment;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CourseGroup_Group_Semester_Year' AND object_id = OBJECT_ID('CourseGroup'))
    DROP INDEX IX_CourseGroup_Group_Semester_Year ON CourseGroup;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_StudentGroupHistory_Student_Year' AND object_id = OBJECT_ID('StudentGroupHistory'))
    DROP INDEX IX_StudentGroupHistory_Student_Year ON StudentGroupHistory;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Grade_GradeValue' AND object_id = OBJECT_ID('Grade'))
    DROP INDEX IX_Grade_GradeValue ON Grade;
GO

/* Index 1: fast lookup of enrollments by student */
CREATE INDEX IX_Enrollment_StudentID
ON Enrollment(StudentID);
GO

/* Index 2: fast lookup of coursegroups by group + semester + year */
CREATE INDEX IX_CourseGroup_Group_Semester_Year
ON CourseGroup(GroupID, Semester, AcademicYear);
GO

/* Index 3: fast lookup of group history */
CREATE INDEX IX_StudentGroupHistory_Student_Year
ON StudentGroupHistory(StudentID, AcademicYear);
GO

/* Index 4: fast filtering by grade value */
CREATE INDEX IX_Grade_GradeValue
ON Grade(GradeValue);
GO
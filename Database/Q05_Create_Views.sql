/*
Q05_Create_Views
CREATE VIEW must be in its own batch, so keep this step separate.
*/

USE UniversityDB;
GO

/* Drop views if they already exist */
IF OBJECT_ID('vw_StudentGrades', 'V') IS NOT NULL DROP VIEW vw_StudentGrades;
GO
IF OBJECT_ID('vw_CurrentStudentGroup', 'V') IS NOT NULL DROP VIEW vw_CurrentStudentGroup;
GO
IF OBJECT_ID('vw_GraduationSummary', 'V') IS NOT NULL DROP VIEW vw_GraduationSummary;
GO
IF OBJECT_ID('vw_InstructorAssignments', 'V') IS NOT NULL DROP VIEW vw_InstructorAssignments;
GO

/* 1. Student grades view */
CREATE VIEW vw_StudentGrades AS
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    c.CourseName,
    gr.GradeValue,
    gr.Comments
FROM Student s
JOIN Enrollment e ON s.StudentID = e.StudentID
JOIN Grade gr ON e.EnrollmentID = gr.EnrollmentID
JOIN CourseGroup cg ON e.CourseGroupID = cg.CourseGroupID
JOIN Course c ON cg.CourseID = c.CourseID;
GO

/* 2. Current student group view
   Here we use the latest academic year in history as the current group.
*/
CREATE VIEW vw_CurrentStudentGroup AS
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    g.GroupName,
    g.AcademicYear,
    f.FacultyName,
    sy.YearNumber
FROM Student s
JOIN StudentGroupHistory sgh 
    ON s.StudentID = sgh.StudentID
JOIN [Group] g 
    ON sgh.GroupID = g.GroupID
JOIN Faculty f 
    ON g.FacultyID = f.FacultyID
JOIN StudyYear sy 
    ON g.StudyYearID = sy.StudyYearID
WHERE sgh.AcademicYear = (
    SELECT MAX(sgh2.AcademicYear)
    FROM StudentGroupHistory sgh2
    WHERE sgh2.StudentID = s.StudentID
);
GO

/* 3. Graduation summary view */
CREATE VIEW vw_GraduationSummary AS
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    gd.Degree,
    gd.FinalGrade,
    gd.Honors,
    gd.GraduationDate
FROM Graduation gd
JOIN Student s ON gd.StudentID = s.StudentID;
GO

/* 4. Instructor assignments view */
CREATE VIEW vw_InstructorAssignments AS
SELECT
    i.InstructorID,
    i.Name,
    i.Surname,
    c.CourseName,
    g.GroupName,
    cg.Semester,
    cg.AcademicYear
FROM Instructor i
JOIN CourseGroup cg ON i.InstructorID = cg.InstructorID
JOIN Course c ON cg.CourseID = c.CourseID
JOIN [Group] g ON cg.GroupID = g.GroupID;
GO

/* Test the views */
SELECT * FROM vw_StudentGrades;
SELECT * FROM vw_CurrentStudentGroup;
SELECT * FROM vw_GraduationSummary;
SELECT * FROM vw_InstructorAssignments;
GO
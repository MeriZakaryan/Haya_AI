/*
Q04_DQL_Queries
*/

USE UniversityDB;
GO

/* 1. Show all students */
SELECT * 
FROM Student;
GO

/* 2. Show all groups with faculty and study year */
SELECT 
    g.GroupID,
    g.GroupName,
    g.AcademicYear,
    f.FacultyName,
    sy.YearNumber
FROM [Group] g
JOIN Faculty f ON g.FacultyID = f.FacultyID
JOIN StudyYear sy ON g.StudyYearID = sy.StudyYearID
ORDER BY g.GroupID;
GO

/* 3. Show all course assignments */
SELECT
    cg.CourseGroupID,
    c.CourseName,
    g.GroupName,
    i.Name + ' ' + i.Surname AS Instructor,
    cg.Semester,
    cg.AcademicYear
FROM CourseGroup cg
JOIN Course c ON cg.CourseID = c.CourseID
JOIN [Group] g ON cg.GroupID = g.GroupID
JOIN Instructor i ON cg.InstructorID = i.InstructorID
ORDER BY cg.CourseGroupID;
GO

/* 4. Show student enrollments */
SELECT
    e.EnrollmentID,
    s.Name,
    s.Surname,
    c.CourseName,
    g.GroupName,
    cg.Semester,
    cg.AcademicYear
FROM Enrollment e
JOIN Student s ON e.StudentID = s.StudentID
JOIN CourseGroup cg ON e.CourseGroupID = cg.CourseGroupID
JOIN Course c ON cg.CourseID = c.CourseID
JOIN [Group] g ON cg.GroupID = g.GroupID
ORDER BY e.EnrollmentID;
GO

/* 5. Show grades */
SELECT
    gr.GradeID,
    s.Name,
    s.Surname,
    c.CourseName,
    gr.GradeValue,
    gr.Comments
FROM Grade gr
JOIN Enrollment e ON gr.EnrollmentID = e.EnrollmentID
JOIN Student s ON e.StudentID = s.StudentID
JOIN CourseGroup cg ON e.CourseGroupID = cg.CourseGroupID
JOIN Course c ON cg.CourseID = c.CourseID
ORDER BY gr.GradeID;
GO

/* 6. Show only failing grades (below 10) */
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    c.CourseName,
    gr.GradeValue
FROM Grade gr
JOIN Enrollment e ON gr.EnrollmentID = e.EnrollmentID
JOIN Student s ON e.StudentID = s.StudentID
JOIN CourseGroup cg ON e.CourseGroupID = cg.CourseGroupID
JOIN Course c ON cg.CourseID = c.CourseID
WHERE gr.GradeValue < 10
ORDER BY gr.GradeValue;
GO

/* 7. Show graduation records */
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    gd.Degree,
    gd.FinalGrade,
    gd.Honors,
    gd.GraduationDate
FROM Graduation gd
JOIN Student s ON gd.StudentID = s.StudentID
ORDER BY gd.StudentID;
GO

/* 8. Show each student's average grade */
SELECT
    s.StudentID,
    s.Name,
    s.Surname,
    CAST(AVG(gr.GradeValue) AS DECIMAL(4,2)) AS AverageGrade
FROM Student s
JOIN Enrollment e ON s.StudentID = e.StudentID
JOIN Grade gr ON e.EnrollmentID = gr.EnrollmentID
GROUP BY s.StudentID, s.Name, s.Surname
ORDER BY AverageGrade DESC;
GO
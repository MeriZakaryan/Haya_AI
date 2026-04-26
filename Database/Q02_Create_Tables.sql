/*
Q02_Create_Tables
This creates all 11 tables with PK, FK, UNIQUE, and CHECK constraints.
*/

USE UniversityDB;
GO

/* 1. STUDENT */
CREATE TABLE Student (
    StudentID INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE
);
GO

/* 2. FACULTY */
CREATE TABLE Faculty (
    FacultyID INT PRIMARY KEY,
    FacultyName VARCHAR(100) NOT NULL
);
GO

/* 3. STUDYYEAR */
CREATE TABLE StudyYear (
    StudyYearID INT PRIMARY KEY,
    YearNumber INT NOT NULL CHECK (YearNumber BETWEEN 1 AND 4)
);
GO

/* 4. GROUP
   [Group] is reserved in SQL Server, so we use square brackets.
*/
CREATE TABLE [Group] (
    GroupID INT PRIMARY KEY,
    GroupName VARCHAR(100) NOT NULL,
    AcademicYear INT NOT NULL,
    FacultyID INT NOT NULL,
    StudyYearID INT NOT NULL,
    CONSTRAINT FK_Group_Faculty
        FOREIGN KEY (FacultyID) REFERENCES Faculty(FacultyID),
    CONSTRAINT FK_Group_StudyYear
        FOREIGN KEY (StudyYearID) REFERENCES StudyYear(StudyYearID)
);
GO

/* 5. COURSE */
CREATE TABLE Course (
    CourseID INT PRIMARY KEY,
    CourseName VARCHAR(100) NOT NULL,
    Credits INT NOT NULL CHECK (Credits BETWEEN 1 AND 10)
);
GO

/* 6. INSTRUCTOR */
CREATE TABLE Instructor (
    InstructorID INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Surname VARCHAR(50) NOT NULL
);
GO

/* 7. COURSEGROUP
   A course taught to a specific group in a semester and academic year.
*/
CREATE TABLE CourseGroup (
    CourseGroupID INT PRIMARY KEY,
    Semester INT NOT NULL CHECK (Semester IN (1, 2)),
    AcademicYear INT NOT NULL,
    CourseID INT NOT NULL,
    InstructorID INT NOT NULL,
    GroupID INT NOT NULL,
    CONSTRAINT FK_CourseGroup_Course
        FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    CONSTRAINT FK_CourseGroup_Instructor
        FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID),
    CONSTRAINT FK_CourseGroup_Group
        FOREIGN KEY (GroupID) REFERENCES [Group](GroupID)
);
GO

/* 8. ENROLLMENT
   Student takes a specific CourseGroup.
*/
CREATE TABLE Enrollment (
    EnrollmentID INT PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseGroupID INT NOT NULL,
    CONSTRAINT FK_Enrollment_Student
        FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    CONSTRAINT FK_Enrollment_CourseGroup
        FOREIGN KEY (CourseGroupID) REFERENCES CourseGroup(CourseGroupID),
    CONSTRAINT UQ_Enrollment_Student_CourseGroup
        UNIQUE (StudentID, CourseGroupID)
);
GO

/* 9. GRADE
   One enrollment receives one grade.
*/
CREATE TABLE Grade (
    GradeID INT PRIMARY KEY,
    GradeValue DECIMAL(4,2) NOT NULL CHECK (GradeValue BETWEEN 0 AND 20),
    Comments VARCHAR(255) NULL,
    EnrollmentID INT NOT NULL UNIQUE,
    CONSTRAINT FK_Grade_Enrollment
        FOREIGN KEY (EnrollmentID) REFERENCES Enrollment(EnrollmentID)
);
GO

/* 10. STUDENTGROUPHISTORY
   Keeps track of student group history.
*/
CREATE TABLE StudentGroupHistory (
    StudentID INT NOT NULL,
    GroupID INT NOT NULL,
    AcademicYear INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NULL,
    CONSTRAINT PK_StudentGroupHistory
        PRIMARY KEY (StudentID, GroupID, AcademicYear),
    CONSTRAINT FK_StudentGroupHistory_Student
        FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    CONSTRAINT FK_StudentGroupHistory_Group
        FOREIGN KEY (GroupID) REFERENCES [Group](GroupID),
    CONSTRAINT CK_StudentGroupHistory_Dates
        CHECK (EndDate IS NULL OR EndDate >= StartDate)
);
GO

/* 11. GRADUATION
   One student can have only one graduation record in this model.
*/
CREATE TABLE Graduation (
    GraduationID INT PRIMARY KEY,
    GraduationDate DATE NOT NULL,
    FinalGrade DECIMAL(4,2) NOT NULL CHECK (FinalGrade BETWEEN 0 AND 20),
    Degree VARCHAR(100) NOT NULL,
    Honors VARCHAR(100) NULL,
    StudentID INT NOT NULL UNIQUE,
    CONSTRAINT FK_Graduation_Student
        FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);
GO
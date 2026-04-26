/*
Q03_Insert_Data
This step inserts data into all 11 tables.

- Grades are between 0 and 20
- Below 10 = failing grade
*/

USE UniversityDB;
GO

/* =========================================================
   1) FACULTY  (5 rows)
   ========================================================= */
INSERT INTO Faculty (FacultyID, FacultyName)
VALUES
(1, 'Droit'),
(2, 'Gestion'),
(3, 'Finances'),
(4, 'Marketing'),
(5, 'IMA');
GO

/* =========================================================
   2) STUDYYEAR  (45 rows to satisfy assignment)
   ========================================================= */
;WITH N AS
(
    SELECT TOP (45) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
)
INSERT INTO StudyYear (StudyYearID, YearNumber)
SELECT n, ((n - 1) % 4) + 1
FROM N;
GO

/* =========================================================
   3) GROUP  (50 rows)
   Groups are built only from the 5 faculties above.
   ========================================================= */
;WITH N AS
(
    SELECT TOP (50) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
)
INSERT INTO [Group] (GroupID, GroupName, AcademicYear, FacultyID, StudyYearID)
SELECT
    n AS GroupID,
    CONCAT(f.FacultyName, '-', ((n - 1) % 4) + 1, '-', RIGHT('00' + CAST(n AS VARCHAR(2)), 2)) AS GroupName,
    2023 + ((n - 1) % 3) AS AcademicYear,
    ((n - 1) % 5) + 1 AS FacultyID,       -- only 5 faculties
    ((n - 1) % 45) + 1 AS StudyYearID
FROM N
JOIN Faculty f
    ON f.FacultyID = ((n - 1) % 5) + 1;
GO

/* =========================================================
   4) COURSE  (50 rows)
   ========================================================= */
INSERT INTO Course (CourseID, CourseName, Credits)
VALUES
(1,'Database Systems',5),
(2,'Programming Fundamentals',5),
(3,'Object Oriented Programming',5),
(4,'Data Structures',5),
(5,'Algorithms',5),
(6,'Computer Networks',4),
(7,'Operating Systems',5),
(8,'Web Development',4),
(9,'Software Engineering',5),
(10,'Artificial Intelligence',5),
(11,'Machine Learning',5),
(12,'Statistics',4),
(13,'Linear Algebra',4),
(14,'Calculus',4),
(15,'Business Law',4),
(16,'Corporate Finance',5),
(17,'Marketing Principles',4),
(18,'Digital Marketing',4),
(19,'Accounting I',4),
(20,'Accounting II',4),
(21,'Microeconomics',4),
(22,'Macroeconomics',4),
(23,'Project Management',3),
(24,'Human Resource Management',3),
(25,'Strategic Management',4),
(26,'Commercial Law',4),
(27,'Civil Law',4),
(28,'Constitutional Law',4),
(29,'Banking Operations',4),
(30,'Investment Analysis',5),
(31,'Taxation',4),
(32,'Insurance Management',4),
(33,'Entrepreneurship',3),
(34,'Business Communication',3),
(35,'Research Methods',3),
(36,'Data Analysis',4),
(37,'Business Intelligence',4),
(38,'French Language',2),
(39,'English Language',2),
(40,'Public Speaking',2),
(41,'International Trade',4),
(42,'Logistics Management',4),
(43,'Tourism Management',3),
(44,'Digital Media Strategy',3),
(45,'Ethics',2),
(46,'Cybersecurity Basics',4),
(47,'Cloud Computing',4),
(48,'Mobile Development',4),
(49,'Information Systems',4),
(50,'Advanced Databases',5);
GO

/* =========================================================
   5) INSTRUCTOR  (50 rows)
   ========================================================= */
INSERT INTO Instructor (InstructorID, Name, Surname)
VALUES
(1,'Anna','Petrosyan'),
(2,'David','Hakobyan'),
(3,'Mariam','Sargsyan'),
(4,'Arman','Avetisyan'),
(5,'Lilit','Mkrtchyan'),
(6,'Karen','Stepanyan'),
(7,'Sona','Harutyunyan'),
(8,'Narek','Grigoryan'),
(9,'Mane','Vardanyan'),
(10,'Gor','Poghosyan'),
(11,'Aren','Karapetyan'),
(12,'Nune','Gabrielyan'),
(13,'Tigran','Martirosyan'),
(14,'Meri','Khachatryan'),
(15,'Levon','Sahakyan'),
(16,'Ani','Arakelyan'),
(17,'Vahe','Melkonyan'),
(18,'Tatev','Manukyan'),
(19,'Ashot','Barseghyan'),
(20,'Ruzanna','Danielyan'),
(21,'Edgar','Simonyan'),
(22,'Hasmik','Hovsepyan'),
(23,'Samvel','Asatryan'),
(24,'Kristine','Yeremyan'),
(25,'Vardan','Gevorgyan'),
(26,'Margarita','Mkhitaryan'),
(27,'Hayk','Nalbandyan'),
(28,'Armine','Badalyan'),
(29,'Sergey','Minasyan'),
(30,'Marine','Aleksanyan'),
(31,'Albert','Tovmasyan'),
(32,'Narine','Piliposyan'),
(33,'Artur','Babayan'),
(34,'Elmira','Aghajanyan'),
(35,'Knarik','Terteryan'),
(36,'Areg','Dallakyan'),
(37,'Silva','Margaryan'),
(38,'Liana','Torosyan'),
(39,'Ruben','Safaryan'),
(40,'Shushan','Kocharyan'),
(41,'Gevorg','Hovhannisyan'),
(42,'Susanna','Yeghiazaryan'),
(43,'Gagik','Petrosyan'),
(44,'Nelly','Mikayelyan'),
(45,'Hrant','Abrahamyan'),
(46,'Emma','Sarkisyan'),
(47,'Arpi','Chobanyan'),
(48,'Alek','Balyan'),
(49,'Tina','Osipyan'),
(50,'Raffi','Galstyan');
GO

/* =========================================================
   6) STUDENT  (50 rows)
   ========================================================= */
INSERT INTO Student (StudentID, Name, Surname, Email)
VALUES
(1,'Arman','Petrosyan','arman.petrosyan1@university.am'),
(2,'Ani','Hakobyan','ani.hakobyan2@university.am'),
(3,'David','Sargsyan','david.sargsyan3@university.am'),
(4,'Mariam','Avetisyan','mariam.avetisyan4@university.am'),
(5,'Karen','Mkrtchyan','karen.mkrtchyan5@university.am'),
(6,'Lilit','Stepanyan','lilit.stepanyan6@university.am'),
(7,'Narek','Harutyunyan','narek.harutyunyan7@university.am'),
(8,'Sona','Grigoryan','sona.grigoryan8@university.am'),
(9,'Aren','Vardanyan','aren.vardanyan9@university.am'),
(10,'Mane','Poghosyan','mane.poghosyan10@university.am'),
(11,'Gor','Karapetyan','gor.karapetyan11@university.am'),
(12,'Anna','Gabrielyan','anna.gabrielyan12@university.am'),
(13,'Levon','Martirosyan','levon.martirosyan13@university.am'),
(14,'Meri','Khachatryan','meri.khachatryan14@university.am'),
(15,'Vahe','Sahakyan','vahe.sahakyan15@university.am'),
(16,'Nune','Arakelyan','nune.arakelyan16@university.am'),
(17,'Ashot','Melkonyan','ashot.melkonyan17@university.am'),
(18,'Tatev','Manukyan','tatev.manukyan18@university.am'),
(19,'Edgar','Barseghyan','edgar.barseghyan19@university.am'),
(20,'Hasmik','Danielyan','hasmik.danielyan20@university.am'),
(21,'Samvel','Simonyan','samvel.simonyan21@university.am'),
(22,'Kristine','Hovsepyan','kristine.hovsepyan22@university.am'),
(23,'Vardan','Asatryan','vardan.asatryan23@university.am'),
(24,'Margarita','Yeremyan','margarita.yeremyan24@university.am'),
(25,'Hayk','Gevorgyan','hayk.gevorgyan25@university.am'),
(26,'Armine','Mkhitaryan','armine.mkhitaryan26@university.am'),
(27,'Sergey','Nalbandyan','sergey.nalbandyan27@university.am'),
(28,'Marine','Badalyan','marine.badalyan28@university.am'),
(29,'Albert','Minasyan','albert.minasyan29@university.am'),
(30,'Narine','Aleksanyan','narine.aleksanyan30@university.am'),
(31,'Artur','Tovmasyan','artur.tovmasyan31@university.am'),
(32,'Elmira','Piliposyan','elmira.piliposyan32@university.am'),
(33,'Knarik','Babayan','knarik.babayan33@university.am'),
(34,'Areg','Aghajanyan','areg.aghajanyan34@university.am'),
(35,'Silva','Terteryan','silva.terteryan35@university.am'),
(36,'Liana','Dallakyan','liana.dallakyan36@university.am'),
(37,'Ruben','Margaryan','ruben.margaryan37@university.am'),
(38,'Shushan','Torosyan','shushan.torosyan38@university.am'),
(39,'Gevorg','Safaryan','gevorg.safaryan39@university.am'),
(40,'Susanna','Kocharyan','susanna.kocharyan40@university.am'),
(41,'Gagik','Hovhannisyan','gagik.hovhannisyan41@university.am'),
(42,'Nelly','Yeghiazaryan','nelly.yeghiazaryan42@university.am'),
(43,'Hrant','Petrosyan','hrant.petrosyan43@university.am'),
(44,'Emma','Mikayelyan','emma.mikayelyan44@university.am'),
(45,'Arpi','Abrahamyan','arpi.abrahamyan45@university.am'),
(46,'Alek','Sarkisyan','alek.sarkisyan46@university.am'),
(47,'Tina','Chobanyan','tina.chobanyan47@university.am'),
(48,'Raffi','Balyan','raffi.balyan48@university.am'),
(49,'Lusine','Osipyan','lusine.osipyan49@university.am'),
(50,'Taron','Galstyan','taron.galstyan50@university.am');
GO

/* =========================================================
   7) COURSEGROUP  (50 rows)
   ========================================================= */
INSERT INTO CourseGroup (CourseGroupID, Semester, AcademicYear, CourseID, InstructorID, GroupID)
SELECT
    g.GroupID AS CourseGroupID,
    CASE WHEN g.GroupID % 2 = 0 THEN 2 ELSE 1 END AS Semester,
    g.AcademicYear,
    ((g.GroupID - 1) % 50) + 1 AS CourseID,
    ((g.GroupID - 1) % 50) + 1 AS InstructorID,
    g.GroupID
FROM [Group] g
WHERE g.GroupID BETWEEN 1 AND 50;
GO

/* =========================================================
   8) STUDENTGROUPHISTORY  (50 rows)
   Each student is assigned to one group.
   ========================================================= */
INSERT INTO StudentGroupHistory (StudentID, GroupID, AcademicYear, StartDate, EndDate)
SELECT
    s.StudentID,
    g.GroupID,
    g.AcademicYear,
    DATEFROMPARTS(g.AcademicYear, 9, 1) AS StartDate,
    DATEFROMPARTS(g.AcademicYear + 1, 6, 30) AS EndDate
FROM Student s
JOIN [Group] g
    ON g.GroupID = s.StudentID;   -- student 1 -> group 1, student 2 -> group 2, etc.
GO

/* =========================================================
   9) ENROLLMENT  (100 rows)
   Each student gets two enrollments.
   ========================================================= */
;WITH FirstEnrollments AS
(
    SELECT
        ROW_NUMBER() OVER (ORDER BY StudentID) AS EnrollmentID,
        StudentID,
        StudentID AS CourseGroupID
    FROM Student
),
SecondEnrollments AS
(
    SELECT
        50 + ROW_NUMBER() OVER (ORDER BY StudentID) AS EnrollmentID,
        StudentID,
        CASE 
            WHEN StudentID + 10 <= 50 THEN StudentID + 10
            ELSE StudentID - 40
        END AS CourseGroupID
    FROM Student
)
INSERT INTO Enrollment (EnrollmentID, StudentID, CourseGroupID)
SELECT EnrollmentID, StudentID, CourseGroupID FROM FirstEnrollments
UNION ALL
SELECT EnrollmentID, StudentID, CourseGroupID FROM SecondEnrollments;
GO

/* =========================================================
   10) GRADE  (100 rows)
   Grades are between 0 and 20.
   ========================================================= */
INSERT INTO Grade (GradeID, GradeValue, Comments, EnrollmentID)
SELECT
    EnrollmentID AS GradeID,
    CAST(CASE 
            WHEN EnrollmentID % 15 = 0 THEN 9
            WHEN EnrollmentID % 14 = 0 THEN 10
            WHEN EnrollmentID % 13 = 0 THEN 11
            WHEN EnrollmentID % 12 = 0 THEN 12
            WHEN EnrollmentID % 11 = 0 THEN 13
            WHEN EnrollmentID % 10 = 0 THEN 14
            WHEN EnrollmentID % 9 = 0 THEN 15
            WHEN EnrollmentID % 8 = 0 THEN 16
            WHEN EnrollmentID % 7 = 0 THEN 17
            WHEN EnrollmentID % 6 = 0 THEN 18
            WHEN EnrollmentID % 5 = 0 THEN 19
            ELSE 20
         END AS DECIMAL(4,2)) AS GradeValue,
    CASE
        WHEN EnrollmentID % 15 = 0 THEN 'Needs improvement'
        WHEN EnrollmentID % 10 = 0 THEN 'Satisfactory performance'
        ELSE 'Good performance'
    END AS Comments,
    EnrollmentID
FROM Enrollment;
GO

/* =========================================================
   11) GRADUATION  (45 rows)
   ========================================================= */
INSERT INTO Graduation (GraduationID, GraduationDate, FinalGrade, Degree, Honors, StudentID)
SELECT
    StudentID AS GraduationID,
    DATEFROMPARTS(2026, 6, 30) AS GraduationDate,
    CAST(10 + (StudentID % 11) AS DECIMAL(4,2)) AS FinalGrade,
    'Bachelor' AS Degree,
    CASE
        WHEN (10 + (StudentID % 11)) >= 18 THEN 'High Honors'
        WHEN (10 + (StudentID % 11)) >= 16 THEN 'Honors'
        ELSE 'No Honors'
    END AS Honors,
    StudentID
FROM Student
WHERE StudentID <= 45;
GO

/* =========================================================
   Small DML management examples 
   ========================================================= */

/* Improve comments for high grades */
UPDATE Grade
SET Comments = 'Excellent performance'
WHERE GradeValue >= 18;
GO

/* Standardize honors text */
UPDATE Graduation
SET Honors = 'Distinction'
WHERE FinalGrade >= 18;
GO
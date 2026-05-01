// Select elements
const loginLink = document.getElementById("loginLink");
const homeLink = document.getElementById("homeLink");

const beforeLoginSection = document.querySelector(".beforeLogin");
const loginSection = document.getElementById("loginSection");

const passwordInput = document.getElementById("passwordInput");
const showPasswordToggle = document.getElementById("showPasswordToggle");

const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("usernameInput");

const profilePage = document.getElementById("profilePage");
const navRight = document.getElementById("navRight");

const professorDashboard = document.getElementById("professorDashboard");
const professorCoursesPage = document.getElementById("professorCoursesPage");

const studentsListPage = document.getElementById("studentsListPage");
const enterGradesPage = document.getElementById("enterGradesPage");

const professorMaterialsPage =
document.getElementById("professorMaterialsPage");


const VALID_USER = {
    username: "student",
    password: "1234",
    fullName: "John Doe",
    email: "john.doe@student.am",
    phone: "+374 91 123456",
    gradeMean: 18.4,
    year: "3rd year",
    avatar: "IMG/profile_pic.png"
};

const VALID_PROFESSOR = {
    username: "professor",
    password: "1234",
    fullName: "Dr. Pascal Sainrat",
    email: "pascal.sainrat@university.am",
    department: "Computer Science",
    avatar: "IMG/professor_pic.jpg"
};

let professorMaterials = [
    {
        course:"Probability Theory",
        title:"Lecture 1 - Random Variables",
        file:"lecture1.pdf"
    },
    {
        course:"Logic",
        title:"Predicate Logic Notes",
        file:"logic.pdf"
    }
];

let professorGrades = {
    "Probability Theory": [
        { name: "John Doe", grade: "17.5" },
        { name: "Emily Smith", grade: "" },
        { name: "Karapet Hovhannisyan", grade: "18" }
    ],
    "Discrete Mathematics": [
        { name: "John Doe", grade: "16" },
        { name: "Emily Smith", grade: "18.5" },
        { name: "Karapet Hovhannisyan", grade: "" }
    ],
    "Logic": [
        { name: "John Doe", grade: "" },
        { name: "Emily Smith", grade: "19" },
        { name: "Karapet Hovhannisyan", grade: "" }
    ]
};
// Show Login
loginLink.addEventListener("click", function (event) {
    event.preventDefault();

    beforeLoginSection.style.display = "none";
    loginSection.style.display = "block";
});

// Show Home (before login)
homeLink.addEventListener("click", function (event) {
    event.preventDefault();

    loginSection.style.display = "none";
    beforeLoginSection.style.display = "block";
});


//show password part
showPasswordToggle.addEventListener("change", () => {
    passwordInput.type = showPasswordToggle.checked ? "text" : "password";
});


loginBtn.addEventListener("click", function (event) {
    event.preventDefault(); // prevent form refresh

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (
        username === VALID_USER.username &&
        password === VALID_USER.password

    ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentPage", "profile");

        beforeLoginSection.style.display = "none";
        loginSection.style.display = "none";
        profilePage.style.display = "block";

        updateNavbarAfterLogin();
    } 
    else if (
    username === VALID_PROFESSOR.username &&
    password === VALID_PROFESSOR.password
) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "professor");
    localStorage.setItem("currentPage", "professorDashboard");

    beforeLoginSection.style.display = "none";
    loginSection.style.display = "none";

    updateProfessorNavbar();
    showProfessorDashboard();
}
    
    else {
        alert("Invalid username or password");
    }
});



function updateNavbarAfterLogin() {
    navRight.innerHTML = `
    <a href="#" id="profileHome">Home</a>
    <a href="#" id="assistantLink">AI Assistant</a>
    <a href="#" id="coursesLink">Courses</a>
    <a href="#" id="profileName" class="navProfile">
    <img src="${VALID_USER.avatar}" alt="Profile" />
    <span>${VALID_USER.fullName}</span>


        <div class="profileMenu" id="profileMenu">
            <button id="logoutBtn">Log out</button>
        </div>
    </a>`;

    const profileHome = document.getElementById("profileHome");

    profileHome.addEventListener("click", (e) => {
        e.preventDefault();

        hideAllSections();
        profilePage.style.display = "block";
        localStorage.setItem("currentPage", "profile");

    });

    const studentNameSpan = document.getElementById("studentName");
    if (studentNameSpan) {
        studentNameSpan.textContent = VALID_USER.fullName;
    }

    const profileName = document.getElementById("profileName");
    const profileMenu = document.getElementById("profileMenu");
    const logoutBtn = document.getElementById("logoutBtn");
    const assistantLink = document.getElementById("assistantLink");
    const aiAssistantPage = document.getElementById("aiAssistantPage");
    const coursesLink = document.getElementById("coursesLink");
    const coursesPage = document.getElementById("coursesPage");

    coursesLink.addEventListener("click", (e) => {
        e.preventDefault();

        hideAllSections();

        // reset rollups on entry
        document.querySelectorAll(".courseItem").forEach(item => {
            item.classList.remove("open");
        });

        coursesPage.style.display = "block";
        localStorage.setItem("currentPage", "courses");

        initCoursesPage();

    });
    assistantLink.addEventListener("click", (e) => {
        e.preventDefault();

        hideAllSections();
        aiAssistantPage.style.display = "block";
        localStorage.setItem("currentPage", "assistant");

    });


    document.addEventListener("click", (e) => {
        if (
            !profileMenu.contains(e.target) &&
            !profileName.contains(e.target)
        ) {
            profileMenu.classList.remove("show");
        }
    });

    profileName.addEventListener("click", (e) => {
        e.preventDefault();
        profileMenu.classList.toggle("show");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
    });

    document.getElementById("profileAvatar").src = VALID_USER.avatar;
    document.getElementById("profileEmail").textContent = VALID_USER.email;
    document.getElementById("profilePhone").textContent = VALID_USER.phone;
    document.getElementById("profileGrade").textContent = VALID_USER.gradeMean;
    document.getElementById("profileYear").textContent = VALID_USER.year;

}


function updateProfessorNavbar() {
    navRight.innerHTML = `
        <a href="#" id="professorHome">Home</a>
        <a href="#" id="professorCoursesLink">My Courses</a>
        <a href="#" id="studentsListLink">Students List</a>
        <a href="#" id="enterGradesLink">Enter Grades</a>
        <a href="#" id="courseMaterialsLink">Course Materials</a>

        <a href="#" id="professorName" class="navProfile">
            <img src="${VALID_PROFESSOR.avatar}" alt="Professor" />
            <span>${VALID_PROFESSOR.fullName}</span>

            <div class="profileMenu" id="professorMenu">
                <button id="professorLogoutBtn">Log out</button>
            </div>
        </a>
    `;

    const professorHome = document.getElementById("professorHome");

professorHome.addEventListener("click", (e) => {
    e.preventDefault();
    showProfessorDashboard();
});

    const professorName = document.getElementById("professorName");
    const professorMenu = document.getElementById("professorMenu");
    const professorLogoutBtn = document.getElementById("professorLogoutBtn");

    professorName.addEventListener("click", (e) => {
        e.preventDefault();
        professorMenu.classList.toggle("show");
    });

    professorLogoutBtn.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
    });

    const professorCoursesLink = document.getElementById("professorCoursesLink");

professorCoursesLink.addEventListener("click", (e) => {
    e.preventDefault();
    showProfessorCourses();
});
const studentsListLink = document.getElementById("studentsListLink");

studentsListLink.addEventListener("click", (e) => {
    e.preventDefault();
    showStudentsList();
});
const enterGradesLink = document.getElementById("enterGradesLink");

enterGradesLink.addEventListener("click", (e) => {
    e.preventDefault();
    showEnterGrades();
});

const materialsLink =
document.getElementById("courseMaterialsLink");

materialsLink.addEventListener("click",(e)=>{
    e.preventDefault();
    showProfessorMaterials();
});

}



function showProfessorDashboard() {
    hideAllSections();

    professorDashboard.style.display = "block";

    document.getElementById("professorNameTitle").textContent = VALID_PROFESSOR.fullName;
    document.getElementById("professorAvatar").src = VALID_PROFESSOR.avatar;
    document.getElementById("professorEmail").textContent = VALID_PROFESSOR.email;
    document.getElementById("professorDepartment").textContent = VALID_PROFESSOR.department;
    

    localStorage.setItem("currentPage", "professorDashboard");
}

function showProfessorCourses() {
    hideAllSections();

    professorCoursesPage.style.display = "block";
    localStorage.setItem("currentPage", "professorCourses");

    document.querySelectorAll("#professorCoursesPage .courseHeader").forEach(header => {
        header.onclick = () => {
            header.parentElement.classList.toggle("open");
        };
    });
}

function showStudentsList() {
    hideAllSections();

    studentsListPage.style.display = "block";
    localStorage.setItem("currentPage", "studentsList");
}




const promptForm = document.getElementById("promptForm");
const promptInput = document.getElementById("promptInput");
const chatWindow = document.getElementById("chatWindow");

// AI assistant connection to backend
const SESSION_ID = "session_" + Math.random().toString(36).substr(2, 9);
const BACKEND_URL = "http://localhost:8000";

if (promptForm) {
    promptForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const prompt = promptInput.value.trim();
        if (!prompt) return;

        addMessage(prompt, "user");
        promptInput.value = "";

        // Typing indicator
        const typing = document.createElement("div");
        typing.className = "message ai typing-indicator";
        typing.textContent = "Haya is thinking...";
        typing.id = "typingIndicator";
        chatWindow.appendChild(typing);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: prompt,
                    session_id: SESSION_ID
                })
            });

            const data = await response.json();
            document.getElementById("typingIndicator")?.remove();

            addMessage(data.response, "ai");

            // Show sources if available
            if (data.sources && data.sources.length > 0) {
                const srcMsg = document.createElement("div");
                srcMsg.className = "message ai sources-msg";
                srcMsg.textContent = "📚 Sources: " + data.sources.join(", ");
                chatWindow.appendChild(srcMsg);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }

        } catch (error) {
            document.getElementById("typingIndicator")?.remove();
            addMessage("Sorry, I can't reach the backend. Make sure it's running on port 8000.", "ai");
        }
    });
}

function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function hideAllSections() {
    beforeLoginSection.style.display = "none";
    loginSection.style.display = "none";
    profilePage.style.display = "none";
    aiAssistantPage.style.display = "none";
    coursesPage.style.display = "none";
    professorDashboard.style.display = "none";
    professorCoursesPage.style.display = "none";
    studentsListPage.style.display = "none";
    enterGradesPage.style.display = "none";
    professorMaterialsPage.style.display = "none";
}

function showProfessorMaterials(){
    hideAllSections();

    professorMaterialsPage.style.display = "block";
    localStorage.setItem("currentPage","materials");

    renderMaterialsTable();

    const uploadBtn =
    document.getElementById("uploadMaterialBtn");

    uploadBtn.onclick = () => {

        const course =
        document.getElementById("materialCourse").value;

        const title =
        document.getElementById("materialTitle").value.trim();

        const fileInput =
        document.getElementById("materialFile");

        if(title === "" || fileInput.files.length === 0){
            alert("Fill all fields");
            return;
        }

        professorMaterials.push({
            course: course,
            title: title,
            file: fileInput.files[0].name
        });

        document.getElementById("materialTitle").value = "";
        fileInput.value = "";

        renderMaterialsTable();
    };
}

function renderMaterialsTable(){

    const body =
    document.getElementById("materialsTableBody");

    body.innerHTML = "";

    professorMaterials.forEach(item => {

        body.innerHTML += `
            <tr>
                <td>${item.course}</td>
                <td>${item.title}</td>
                <td>${item.file}</td>
            </tr>
        `;
    });
}

function showEnterGrades() {
    hideAllSections();

    enterGradesPage.style.display = "block";
    localStorage.setItem("currentPage", "enterGrades");

    document.getElementById("gradesCourseList").style.display = "block";
    document.getElementById("gradeEntryPanel").style.display = "none";

document.querySelectorAll(".gradeCourse").forEach(course => {
            course.onclick = () => {
            const courseName = course.dataset.course;
            openGradeEntry(courseName);
        };
    });
}
function openGradeEntry(courseName) {
    document.getElementById("gradesCourseList").style.display = "none";
    document.getElementById("gradeEntryPanel").style.display = "block";
    document.getElementById("gradeCourseTitle").textContent = courseName;

    const tbody = document.getElementById("gradeStudentsBody");
    tbody.innerHTML = "";

    professorGrades[courseName].forEach((student, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.name}</td>
            <td>
                <input 
                    type="number" 
                    min="0" 
                    max="20" 
                    step="0.5"
                    class="gradeInput"
                    data-index="${index}"
                    value="${student.grade}"
                    placeholder="Empty"
                >
            </td>
        `;

        tbody.appendChild(row);
    });

    const submitBtn = document.getElementById("submitGradesBtn");

    submitBtn.onclick = () => {
        const inputs = document.querySelectorAll(".gradeInput");

        inputs.forEach(input => {
            const index = input.dataset.index;
            professorGrades[courseName][index].grade = input.value;
        });

        alert("Grades updated successfully!");

        showEnterGrades();
    };
}


window.addEventListener("load", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentPage = localStorage.getItem("currentPage");

if (isLoggedIn === "true") {
    const role = localStorage.getItem("role");

    if (role === "professor") {
        updateProfessorNavbar();
    } else {
        updateNavbarAfterLogin();
    }
        hideAllSections();

        switch (currentPage) {
            case "assistant":
                aiAssistantPage.style.display = "block";
                break;

            case "courses":
                coursesPage.style.display = "block";
                initCoursesPage();
                break;

            case "professorDashboard":
                showProfessorDashboard();
                break;

            case "materials":
    showProfessorMaterials();
    break;

                case "enterGrades":
    showEnterGrades();
    break;

            case "studentsList":
    showStudentsList();
    break;

            case "professorCourses":
    showProfessorCourses();
    break;

            default:
                profilePage.style.display = "block";
        }
    }
});



function initCoursesPage() {
    // Rollups
    document.querySelectorAll(".courseHeader").forEach(header => {
        header.onclick = () => {
            header.parentElement.classList.toggle("open")
        };
    });

    initCourseDocuments()
}

function initCourseDocuments() {
    document.querySelectorAll(".docItem").forEach(item => {
        item.onclick = () => {
        const pdfSrc = new URL(item.dataset.pdf, window.location.href).href;            const title = item.textContent.trim();

            const pdfWindow = window.open("", "_blank");

            if (!pdfWindow) {
                alert("Popup blocked. Please allow popups for this site.");
                return;
            }

            pdfWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
                <style>
    :root {
        --blue: #2563EB;
        --green: #22C55E;
        --purple: #7C3AED;
        --text-primary: #0F172A;
        --text-secondary: #475569;
        --border: #E2E8F0;
        --bg: #F8FAFC;
        --brand-gradient: linear-gradient(135deg, #22C55E, #2563EB, #7C3AED);
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    body {
        display: flex;
        flex-direction: column;
        background: #fff;
    }

    .header {
        height: 36px;
        min-height: 36px;
        background: var(--brand-gradient);
        color: white;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 0.75rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        z-index: 10;
    }

    .header-left {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .header h1 {
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
        line-height: 1;
    }

    .btnHero {
        padding: 0.2rem 0.7rem;
        border-radius: 6px;
        border: 1px solid white;
        background: white;
        color: var(--blue);
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 600;
        transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.1s ease;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        line-height: 1.1;
    }

    .btnHero:hover {
        background: transparent;
        color: white;
    }

    .btnHero:active {
        box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    }

    .downloadBtn {
    position: absolute;
    left: 80px;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.2rem 0.7rem;
    border-radius: 6px;
    border: 1px solid white;
    background: white;
    color: var(--blue);
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.1;
}

.downloadBtn:hover {
    background: transparent;
    color: white;
}

    .zoomControls {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.zoomControls button {
    width: 26px;
    height: 24px;
    border: 1px solid white;
    border-radius: 5px;
    background: white;
    color: var(--blue);
    cursor: pointer;
    font-weight: 700;
}

.zoomControls span {
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    min-width: 42px;
    text-align: center;
}
    .zoomControls input {
    width: 48px;
    height: 24px;
    border: none;
    border-radius: 5px;
    text-align: center;
    font-size: 0.8rem;
    outline: none;
}

#pageCount {
    min-width: 42px;
}

    .mainArea {
        flex: 1;
        display: flex;
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        overflow: hidden;
    }

    #pdfPagesContainer {
    width: max-content;
    min-width: 100%;
    margin: 0 auto;
    padding: 20px;
}

    .pdfViewer {
    width: 100%;
    height: 100%;
    background: #525659;
    overflow: auto;
    display: block;
    transition: width 0.3s ease;
    flex-shrink: 0;
}

.pdfViewer.shrink {
    width: 75%;
}

    .pdfViewer {
    width: 100%;
    height: 100%;
    background: #525659;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

#pdfCanvas {
    background: white;
}

.pdfPageWrapper {
    position: relative;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

#pdfCanvas {
    display: block;
    background: white;
}

.textLayer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    line-height: 1;
    transform-origin: 0 0;
    text-align: initial;
    text-size-adjust: none;
}

.textLayer span,
.textLayer br {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
}

.textLayer ::selection {
    background: rgba(37, 99, 235, 0.35);
}

    .chatPanel {
        width: 0;
        height: 100%;
        background: white;
        border-left: 1px solid var(--border);
        overflow: hidden;
        transition: width 0.3s ease;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .chatPanel.open {
        width: 25%;
        min-width: 280px;
    }

    .chatHeader {
    padding: 0.75rem 1rem;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    color: var(--blue);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chatCloseBtn {
    border: none;
    background: transparent;
    color: var(--blue);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    line-height: 1;
}

    .chatMessages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: white;
    }

    .chatMessage {
        max-width: 90%;
        padding: 0.7rem 0.9rem;
        border-radius: 12px;
        font-size: 0.9rem;
        line-height: 1.4;
        word-wrap: break-word;
    }

    .chatMessage.ai {
        background: var(--bg);
        color: var(--text-primary);
        align-self: flex-start;
    }

    .chatMessage.user {
        background: var(--blue);
        color: white;
        align-self: flex-end;
    }

    .chatForm {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        border-top: 1px solid var(--border);
        background: white;
    }

    .chatForm input {
        flex: 1;
        padding: 0.65rem 0.8rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
    }

    .chatForm input:focus {
        border-color: var(--blue);
        box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
    }

    .chatSendBtn {
        padding: 0.65rem 0.9rem;
        border: none;
        border-radius: 8px;
        background: var(--blue);
        color: white;
        cursor: pointer;
        font-weight: 600;
    }

    .chatToggle {
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: none;
    background: var(--brand-gradient);
    color: white;
    font-size: 1.4rem;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(0,0,0,0.22);
    z-index: 20;
}

.chatToggle.hidden {
    display: none;
}

.chatToggle:hover {
    filter: brightness(1.05);
}
</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    </head>
                <body>
    <div class="header">
        <div class="header-left">
            <button class="btnHero" onclick="window.close()">← Close</button>
            <a id="downloadPdfBtn" class="downloadBtn" href="${pdfSrc}" download>Download</a>

<div class="zoomControls">
    <button id="zoomOutBtn">−</button>
    <span id="zoomValue">100%</span>
    <button id="zoomInBtn">+</button>

    <input type="number" id="pageInput" min="1" value="1">
    <span id="pageCount">/ 1</span>
</div>

<h1>${title}</h1>
        </div>
    </div>

    <div class="mainArea">
        <div class="pdfViewer" id="pdfViewer">
            <div id="pdfPagesContainer"></div>
        </div>

        <div class="chatPanel" id="chatPanel">
            <div class="chatHeader">
                <span>HAYA AI Assistant</span>
                <button class="chatCloseBtn" id="chatCloseBtn">✕</button>
            </div>

            <div class="chatMessages" id="chatMessages">
                <div class="chatMessage ai">
                    👋 Hi! I’m HAYA. Ask me anything about this document.
                </div>
            </div>

            <form class="chatForm" id="chatForm">
                <input type="text" id="chatInput" placeholder="Ask anything..." />
                <button type="submit" class="chatSendBtn">Send</button>
            </form>
        </div>

        <button class="chatToggle" id="chatToggle">🤖</button>
    </div>

    <script>
        const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const pdfViewer = document.getElementById("pdfViewer");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatCloseBtn = document.getElementById("chatCloseBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomValue = document.getElementById("zoomValue");
const pageInput = document.getElementById("pageInput");
const pageCount = document.getElementById("pageCount");

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const url = "${pdfSrc}";
const pdfPagesContainer = document.getElementById("pdfPagesContainer");


let pdfDoc = null;
let currentPageNumber = 1;
let zoom = 100;


function renderAllPages() {
    if (!pdfDoc) return;

    pdfPagesContainer.innerHTML = "";

    const viewer = document.getElementById("pdfViewer");

    pdfDoc.getPage(1).then(firstPage => {
        const baseViewport = firstPage.getViewport({ scale: 1 });

        const availableWidth = viewer.clientWidth - 40;
        const baseScale = availableWidth / baseViewport.width;
        const finalScale = baseScale * (zoom / 100);

        for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
            pdfDoc.getPage(pageNumber).then(page => {
                const viewport = page.getViewport({ scale: finalScale });

                const pageWrapper = document.createElement("div");
                pageWrapper.className = "pdfPageWrapper";
                pageWrapper.id = "pdf-page-" + pageNumber;
                pageWrapper.style.width = viewport.width + "px";
                pageWrapper.style.height = viewport.height + "px";

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = viewport.width + "px";
                canvas.style.height = viewport.height + "px";

                const textLayer = document.createElement("div");
                textLayer.className = "textLayer";
                textLayer.style.width = viewport.width + "px";
                textLayer.style.height = viewport.height + "px";
                textLayer.style.setProperty("--scale-factor", finalScale);

                pageWrapper.appendChild(canvas);
                pageWrapper.appendChild(textLayer);
                pdfPagesContainer.appendChild(pageWrapper);

                page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise
                    .then(() => page.getTextContent())
                    .then(textContent => {
                        return pdfjsLib.renderTextLayer({
                            textContentSource: textContent,
                            container: textLayer,
                            viewport: viewport,
                            textDivs: []
                        }).promise;
                    });
            });
        }
    });


    setTimeout(updatePageNumberOnScroll, 500);

}


function updatePageNumberOnScroll() {
    const pages = document.querySelectorAll(".pdfPageWrapper");
    const viewer = document.getElementById("pdfViewer");

    let closestPage = 1;
    let closestDistance = Infinity;

    pages.forEach(page => {
        const pageRect = page.getBoundingClientRect();
        const viewerRect = viewer.getBoundingClientRect();

        const distance = Math.abs(pageRect.top - viewerRect.top);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPage = Number(page.id.replace("pdf-page-", ""));
        }
    });

    currentPageNumber = closestPage;
    pageInput.value = currentPageNumber;
}


function putSelectedTextIntoChat() {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        chatInput.value = selectedText;
        chatInput.focus();
    }
}


pdfViewer.addEventListener("mouseup", () => {
    setTimeout(putSelectedTextIntoChat, 100);
});


function updateZoomValue() {
    zoomValue.textContent = zoom + "%";
}

zoomInBtn.addEventListener("click", () => {
    zoom += 10;
    updateZoomValue();
    renderAllPages();
});

zoomOutBtn.addEventListener("click", () => {
    if (zoom > 20) {
        zoom -= 10;
        updateZoomValue();
        renderAllPages();
    }
});


pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let requested = parseInt(pageInput.value);

        if (!requested || requested < 1) requested = 1;
        if (requested > pdfDoc.numPages) requested = pdfDoc.numPages;

        currentPageNumber = requested;
        pageInput.value = currentPageNumber;

        const targetPage = document.getElementById("pdf-page-" + currentPageNumber);

        if (targetPage) {
            targetPage.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }
});

pdfjsLib.getDocument(url).promise
    .then(pdf => {
        pdfDoc = pdf;
        pageCount.textContent = "/ " + pdf.numPages;
        renderAllPages();

        window.addEventListener("resize", renderAllPages);
    })
    .catch(err => {
    document.body.innerHTML = \`
        <div style="padding:20px;font-family:system-ui,sans-serif;color:#b91c1c">
            Failed to load PDF.<br>
            \${err.message}
        </div>
    \`;
    console.error(err);
});

pdfViewer.addEventListener("scroll", () => {
    updatePageNumberOnScroll();
});




chatToggle.addEventListener("click", () => {
    chatPanel.classList.add("open");
    pdfViewer.classList.add("shrink");
    chatToggle.classList.add("hidden");

    setTimeout(renderAllPages, 350);
});

chatCloseBtn.addEventListener("click", () => {
    chatPanel.classList.remove("open");
    pdfViewer.classList.remove("shrink");
    chatToggle.classList.remove("hidden");

    setTimeout(renderAllPages, 350);
});


const PDF_SESSION = "pdf_" + Math.random().toString(36).substr(2, 9);

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    const userMsg = document.createElement("div");
    userMsg.className = "chatMessage user";
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Typing indicator
    const typing = document.createElement("div");
    typing.className = "chatMessage ai";
    typing.id = "pdfTyping";
    typing.textContent = "Haya is thinking...";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const res = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                session_id: PDF_SESSION
            })
        });

        const data = await res.json();
        document.getElementById("pdfTyping")?.remove();

        const aiMsg = document.createElement("div");
        aiMsg.className = "chatMessage ai";
        aiMsg.textContent = data.response;
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (err) {
        document.getElementById("pdfTyping")?.remove();
        const errMsg = document.createElement("div");
        errMsg.className = "chatMessage ai";
        errMsg.textContent = "Backend not reachable. Start the server with: uvicorn backend.main:app --reload --port 8000";
        chatMessages.appendChild(errMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
        

    </script>
</body>
    </html>
`);

            pdfWindow.document.close();
        };
    });
}



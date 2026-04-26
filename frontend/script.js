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

const VALID_USER = {
    username: "student",
    password: "1234",
    fullName: "John Doe",
    email: "john.doe@student.am",
    phone: "+374 91 123456",
    gradeMean: 18.4,
    year: "3rd year",
    avatar: "img/profile_pic.png"
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
    } else {
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


const promptForm = document.getElementById("promptForm");
const promptInput = document.getElementById("promptInput");
const chatWindow = document.getElementById("chatWindow");

if (promptForm) {
    promptForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const prompt = promptInput.value.trim();
        if (!prompt) return;

        // User message
        addMessage(prompt, "user");
        promptInput.value = "";

        // Fake AI response
        setTimeout(() => {
            addMessage(generateFakeResponse(prompt), "ai");
        }, 700);
    });
}

function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.textContent = text;

    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateFakeResponse(prompt) {
    return `That's an interesting question about "${prompt}". 
Try breaking the problem into smaller steps and think about the core concept behind it.`;
}






function hideAllSections() {
    beforeLoginSection.style.display = "none";
    loginSection.style.display = "none";
    profilePage.style.display = "none";
    aiAssistantPage.style.display = "none";
    coursesPage.style.display = "none";
}


window.addEventListener("load", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentPage = localStorage.getItem("currentPage");

    if (isLoggedIn === "true") {
        updateNavbarAfterLogin();
        hideAllSections();

        switch (currentPage) {
            case "assistant":
                aiAssistantPage.style.display = "block";
                break;

            case "courses":
                coursesPage.style.display = "block";
                initCoursesPage();
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

    .mainArea {
        flex: 1;
        display: flex;
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        overflow: hidden;
    }

    .pdfViewer {
        width: 100%;
        height: 100%;
        background: #525659;
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
    margin-top: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
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
            <h1>${title}</h1>
        </div>
    </div>

    <div class="mainArea">
        <div class="pdfViewer" id="pdfViewer">
    <canvas id="pdfCanvas"></canvas>
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

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const url = "${pdfSrc}";
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

let currentPage = null;

function renderPage() {
    if (!currentPage) return;

    const container = document.getElementById("pdfViewer");

    const unscaledViewport = currentPage.getViewport({ scale: 1 });

    const availableWidth = container.clientWidth - 40;
    const availableHeight = container.clientHeight - 40;

    const scaleX = availableWidth / unscaledViewport.width;
    const scaleY = availableHeight / unscaledViewport.height;

    const scale = Math.min(scaleX, scaleY);

    const viewport = currentPage.getViewport({ scale: scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    currentPage.render({
        canvasContext: ctx,
        viewport: viewport
    });
}

pdfjsLib.getDocument(url).promise
    .then(pdf => pdf.getPage(1))
    .then(page => {
        currentPage = page;
        renderPage();

        window.addEventListener("resize", renderPage);
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

chatToggle.addEventListener("click", () => {
    chatPanel.classList.add("open");
    pdfViewer.classList.add("shrink");
    chatToggle.classList.add("hidden");
});

chatCloseBtn.addEventListener("click", () => {
    chatPanel.classList.remove("open");
    pdfViewer.classList.remove("shrink");
    chatToggle.classList.remove("hidden");
});

        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const text = chatInput.value.trim();
            if (!text) return;

            const userMsg = document.createElement("div");
            userMsg.className = "chatMessage user";
            userMsg.textContent = text;
            chatMessages.appendChild(userMsg);

            chatInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                const aiMsg = document.createElement("div");
                aiMsg.className = "chatMessage ai";
                aiMsg.textContent = "I can help explain this PDF step by step. For now, this is a demo response.";
                chatMessages.appendChild(aiMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 500);
        });

        



    </script>
</body>
    </html>
`);

            pdfWindow.document.close();
        };
    });
}



const pages = {
    "System": {
        cards: ["Display", "Sound", "Notifications", "Storage", "Multitasking", "About"]
    },
    "Bluetooth & Devices": {
        cards: ["Bluetooth", "Printers", "Mouse", "Keyboard"]
    },
    "Network & Internet": {
        cards: ["Wi-Fi", "Ethernet", "VPN"]
    },
    "Personalization": {
        cards: ["Background", "Colors", "Themes", "Lock Screen"]
    },
    "Apps": {
        cards: ["Installed Apps", "Default Apps", "Startup"]
    },
    "Accounts": {
        cards: ["Your Info", "Sign-in Options", "Family"]
    },
    "Time & Language": {
        cards: ["Date & Time", "Language", "Typing"]
    }
};

/* ─────────────────────────────
   RENDER SIDEBAR
──────────────────────────────*/
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

Object.keys(pages).forEach((name, i) => {
    let li = document.createElement("li");
    li.innerText = name;
    if (i === 0) li.classList.add("active");

    li.addEventListener("click", () => loadCategory(name));
    sidebar.appendChild(li);
});

/* ─────────────────────────────
   LOAD CATEGORY PAGE
──────────────────────────────*/
function loadCategory(category) {
    fadeContent(() => {
        // switch active tab
        document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
        [...sidebar.children].find(li => li.innerText === category).classList.add("active");

        // render the card grid
        const cards = pages[category].cards;
        content.innerHTML = `
            <h1>${category}</h1>
            <div class="card-grid">
                ${cards.map(c => `<div class="card" onclick="openSubPage('${category}', '${c}')">${c}</div>`).join("")}
            </div>
        `;
    });
}

/* ─────────────────────────────
   OPEN SUB PAGE
──────────────────────────────*/
function openSubPage(category, card) {
    fadeContent(() => {
        content.innerHTML = `
            <div class="sub-page">
                <div class="back-btn" onclick="loadCategory('${category}')">← Back</div>
                <h1>${card}</h1>
                <p>This is the <b>${card}</b> settings page.  
                Add controls, switches, sliders, and UI here.</p>
            </div>
        `;
    });
}

/* ─────────────────────────────
   ANIMATION WRAPPER
──────────────────────────────*/
function fadeContent(callback) {
    content.classList.add("fade-out");

    setTimeout(() => {
        callback();
        content.classList.remove("fade-out");
        content.classList.add("fade-in");

        setTimeout(() => content.classList.remove("fade-in"), 200);
    }, 200);
}

/* ─────────────────────────────
   LOAD FIRST PAGE
──────────────────────────────*/
loadCategory("System");

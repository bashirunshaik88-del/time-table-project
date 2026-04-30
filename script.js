let globalTimetable = {};
let facultyBusy = {};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const PERIODS = 7; // including break slot index = 3

function generate() {

    let subjects = document.getElementById("subjects").value.split(",");
    let faculty = document.getElementById("faculty").value.split(",");
    let labs = document.getElementById("labs").value.split(",");

    let sections = ["A","B","C"];

    globalTimetable = {};
    facultyBusy = {};

    let output = "";

    sections.forEach(section => {

        let tt = {};

        // initialize timetable
        DAYS.forEach(day => {
            tt[day] = new Array(PERIODS).fill("");
        });

        // -------- STEP 1: FIX BREAK --------
        DAYS.forEach(day => {
            tt[day][3] = "BREAK";
        });

        // -------- STEP 2: ADD 1 FREE PERIOD --------
        DAYS.forEach(day => {
            let freeSlot;
            do {
                freeSlot = Math.floor(Math.random() * PERIODS);
            } while (freeSlot === 3); // avoid break

            tt[day][freeSlot] = "FREE";
        });

        // -------- STEP 3: PLACE LABS (3 continuous slots) --------
        labs.forEach((lab, index) => {

            let placed = false;

            while (!placed) {

                let day = DAYS[Math.floor(Math.random()*DAYS.length)];
                let start = Math.floor(Math.random()*4); // 0–3 safe start

                if (start === 2) continue; // avoid crossing break

                let fac = faculty[index % faculty.length];

                let ok = true;

                for (let i=0;i<3;i++) {
                    let slot = start + i;

                    if (slot === 3) ok = false; // avoid break

                    let key = day+"-"+slot;

                    if (!facultyBusy[key]) facultyBusy[key] = new Set();

                    if (facultyBusy[key].has(fac) || tt[day][slot] !== "") {
                        ok = false;
                    }
                }

                if (ok) {
                    for (let i=0;i<3;i++) {
                        let slot = start + i;
                        let key = day+"-"+slot;

                        facultyBusy[key].add(fac);
                        tt[day][slot] = lab + " LAB ("+fac+")";
                    }
                    placed = true;
                }
            }
        });

        // -------- STEP 4: FILL THEORY SUBJECTS --------
        DAYS.forEach(day => {

            for (let slot=0; slot<PERIODS; slot++) {

                if (slot === 3) continue; // break
                if (tt[day][slot] !== "") continue;

                let placed = false;

                for (let attempt=0; attempt<subjects.length; attempt++) {

                    let idx = Math.floor(Math.random()*subjects.length);
                    let sub = subjects[idx];
                    let fac = faculty[idx];

                    let key = day+"-"+slot;

                    if (!facultyBusy[key]) facultyBusy[key] = new Set();

                    if (!facultyBusy[key].has(fac)) {
                        facultyBusy[key].add(fac);
                        tt[day][slot] = sub + " ("+fac+")";
                        placed = true;
                        break;
                    }
                }

                if (!placed) {
                    tt[day][slot] = "FREE"; // fallback
                }
            }
        });

        globalTimetable[section] = tt;
        output += `<h2>Section ${section}</h2>`;
        output += drawTable(tt);
    });

    document.getElementById("output").innerHTML = output;
}


// ---------- TABLE UI ----------
function drawTable(tt) {

    let html = `<table border="1">
    <tr>
        <th>Day</th>
        <th>I<br>7:30-8:25</th>
        <th>II<br>8:25-9:20</th>
        <th>III<br>9:20-10:15</th>
        <th>10:15-10:45</th>
        <th>IV<br>10:45-11:40</th>
        <th>V<br>11:40-12:35</th>
        <th>VI<br>12:35-1:30</th>
    </tr>`;

    DAYS.forEach(day => {
        html += `<tr><td>${day}</td>`;
        for (let i=0;i<PERIODS;i++) {
            html += `<td>${tt[day][i]}</td>`;
        }
        html += "</tr>";
    });

    html += "</table>";
    return html;
}


// ---------- CLASH CHECK ----------
function checkClashes() {

    let clash = false;
    let map = {};

    for (let section in globalTimetable) {
        let tt = globalTimetable[section];

        for (let day in tt) {

            tt[day].forEach((val, i) => {

                if (val.includes("(")) {

                    let fac = val.split("(")[1].replace(")","");
                    let key = day + "-" + i + "-" + fac;

                    if (map[key]) {
                        clash = true;
                    } else {
                        map[key] = true;
                    }
                }
            });
        }
    }

    if (clash) {
        alert("❌ Clashes Found!");
    } else {
        alert("✅ No Clashes!");
    }
}
const days = ["Mon","Tue","Wed","Thu","Fri","Sat"];
let timetableData = {};

function getInputs(){
  return {
    subjects: document.getElementById("subjects").value.split(",").map(x=>x.trim()),
    faculty: document.getElementById("faculty").value.split(",").map(x=>x.trim()),
    labs: document.getElementById("labs").value.split(",").map(x=>x.trim()),
    sections: Array.from(document.getElementById("sections").selectedOptions).map(o=>o.value)
  };
}

// generate timetable safely (NO infinite loop)
function generateTimetable(){
  const {subjects, faculty, labs, sections} = getInputs();
  const slots = [0,1,2,3,4,5]; // 6 periods/day

  timetableData = {};
  let facultyBusy = {}; // track clashes

  sections.forEach(sec=>{
    timetableData[sec] = {};

    days.forEach(day=>{
      timetableData[sec][day] = new Array(6).fill("");

      // fixed positions
      let breakSlot = 2;
      let freeSlot = 5;

      timetableData[sec][day][breakSlot] = "Break";
      timetableData[sec][day][freeSlot] = "Free";
    });
  });

  // LABS (3 continuous hours)
  labs.forEach((lab, i)=>{
    let facultyName = faculty[i % faculty.length];

    days.forEach((day, d)=>{
      if(d >= sections.length) return;

      let sec = sections[d];

      let placed = false;

      for(let start=0; start<=3; start++){
        if(start === 2) continue; // avoid break

        let canPlace = true;

        for(let j=0;j<3;j++){
          let slotKey = day + "_" + (start+j);

          if(
            timetableData[sec][day][start+j] !== "" ||
            facultyBusy[slotKey] === facultyName
          ){
            canPlace = false;
          }
        }

        if(canPlace){
          for(let j=0;j<3;j++){
            timetableData[sec][day][start+j] = lab + " LAB ("+facultyName+")";
            facultyBusy[day+"_"+(start+j)] = facultyName;
          }
          placed = true;
          break;
        }
      }
    });
  });

  // THEORY subjects
  let subIndex = 0;

  sections.forEach(sec=>{
    days.forEach(day=>{
      for(let i=0;i<6;i++){

        if(timetableData[sec][day][i] !== "") continue;

        let subject = subjects[subIndex % subjects.length];
        let fac = faculty[subIndex % faculty.length];

        let key = day + "_" + i;

        // avoid clashes
        if(facultyBusy[key] === fac) continue;

        timetableData[sec][day][i] = subject + " ("+fac+")";
        facultyBusy[key] = fac;

        subIndex++;
      }
    });
  });

  display();
}

// display
function display(){
  let container = document.getElementById("output");
  container.innerHTML = "";

  for(let sec in timetableData){
    let html = `<h2>Section ${sec}</h2>`;
    html += `<table border="1"><tr><th>Day</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>`;

    days.forEach(day=>{
      html += `<tr><td>${day}</td>`;
      timetableData[sec][day].forEach(p=>{
        html += `<td>${p}</td>`;
      });
      html += "</tr>";
    });

    html += "</table><br>";
    container.innerHTML += html;
  }
}

// CLASH CHECK
function checkClashes(){
  let seen = {};

  for(let sec in timetableData){
    for(let day in timetableData[sec]){
      timetableData[sec][day].forEach((p,i)=>{
        if(p.includes("(")){
          let fac = p.split("(")[1].replace(")","");
          let key = day+"_"+i;

          if(seen[key] === fac){
            alert("❌ Clash found for "+fac+" at "+day+" period "+(i+1));
            return;
          }
          seen[key] = fac;
        }
      });
    }
  }

  alert("✅ No clashes!");
}

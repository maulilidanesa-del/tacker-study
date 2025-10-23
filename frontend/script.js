let timer, seconds=0, email='';

// Default backend URL
const backendURL = 'https://YOUR_RENDER_BACKEND_URL'; // Ganti dengan URL Render.com

// Chart.js setup
const ctx = document.getElementById('studyChart').getContext('2d');
let studyChart = new Chart(ctx,{
    type:'line',
    data:{labels:[], datasets:[{label:'Jam Belajar',data:[],fill:true,backgroundColor:'rgba(0,119,182,0.2)',borderColor:'#0077b6',tension:0.3}]},
    options:{responsive:true,scales:{y:{beginAtZero:true,title:{display:true,text:'Jam'}}}}
});

// Auth functions
async function register(){
    const e=document.getElementById('email').value;
    const p=document.getElementById('password').value;
    const res=await fetch(${backendURL}/register,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:e,password:p})
    });
    const data=await res.json(); alert(data.message);
}

async function login(){
    email=document.getElementById('email').value;
    const p=document.getElementById('password').value;
    const res=await fetch(${backendURL}/login,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,email,password:p})
    });
    const data=await res.json();
    if(res.ok){
        alert(data.message);
        document.querySelector('.auth').style.display='none';
        document.querySelector('.tracker').style.display='block';
        updateChart();
    } else alert(data.message);
}

// Timer
function updateTimer(){seconds++;document.getElementById('timer').textContent=formatTime(seconds);}
function startTimer(){if(!timer) timer=setInterval(updateTimer,1000);}
async function stopTimer(){
    if(timer){clearInterval(timer);timer=null; await saveSession();}
}
function resetTimer(){stopTimer();seconds=0;document.getElementById('timer').textContent='00:00:00';}
function formatTime(sec){let h=String(Math.floor(sec/3600)).padStart(2,'0');let m=String(Math.floor((sec%3600)/60)).padStart(2,'0');let s=String(sec%60).padStart(2,'0');return`${h}:${m}:${s}`;}
async function saveSession(){
    if(seconds>0){
        await fetch(${backendURL}/add-session,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email,seconds})
        });
        updateChart();
        checkTarget();
    }
}

// Update chart
async function updateChart(){
    const res=await fetch(${backendURL}/history/${email});
    const data=await res.json();
    const map={};
    data.forEach(h=>map[h.date]=(map[h.date]||0)+h.seconds/3600);
    const labels=Object.keys(map).sort((a,b)=>new Date(a)-new Date(b));
    const values=labels.map(l=>map[l]);
    studyChart.data.labels=labels; studyChart.data.datasets[0].data=values; studyChart.update();
}

// Download CSV
async function downloadCSV(){
    const res=await fetch(${backendURL}/history/${email});
    const data=await res.json();
    let csv='Tanggal,Jam Belajar\n';
    data.forEach(h=>csv+=${h.date},${(h.seconds/3600).toFixed(2)}\n);
    const blob=new Blob([csv],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='riwayat_belajar.csv';
    a.click();
}

// Theme toggle
function toggleTheme(){document.body.classList.toggle('dark');}

// Check target
function checkTarget(){
    const target=document.getElementById('targetHours').value;
    fetch(${backendURL}/history/${email}).then(res=>res.json()).then(data=>{
        const today=new Date().toLocaleDateString();
        const totalToday=data.filter(h=>h.date===today).reduce((a,b)=>a+b.seconds/3600,0);
        if(totalToday>=target) alert(🎉 Target ${target} jam hari ini tercapai!);
    });
}

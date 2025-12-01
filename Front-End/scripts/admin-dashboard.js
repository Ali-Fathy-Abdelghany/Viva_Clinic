// Sidebar Toggle
document.getElementById('menuBtn').addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
});
document.getElementById('overlay').addEventListener('click', function() {
  document.getElementById('sidebar').classList.remove('active');
  this.classList.remove('active');
});
// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(this.dataset.tab).classList.add('active');
  });
});

// Charts
const barCtx = document.getElementById('barChart').getContext('2d');
new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: 'Completed',
        data: [3200,3800,4200,4000,4578,4400,4300,4600,4500,4700,4800,4900],
        backgroundColor: '#59a14f'
      },
      {
        label: 'Reschedule',
        data: [600,650,700,745,780,750,720,780,760,800,820,850],
        backgroundColor: '#f28e2c'
      },
      {
        label: 'Cancelled',
        data: [400,420,440,456,480,460,450,470,460,480,490,500],
        backgroundColor: '#e15759'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 6000 }
    }
  }
});

// Doughnut Chart - بالألوان الدقيقة من الصورة
const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
new Chart(doughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Cardiology', 'Dental', 'Neurology'],
    datasets: [{
      data: [214, 150, 121],
      backgroundColor: ['#4e79a7', '#c84e89', '#6b7280'],
      borderWidth: 0,
      cutout: '70%'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  },
  plugins: [{
    beforeDraw: function(chart) {
      const width = chart.width, height = chart.height, ctx = chart.ctx;
      ctx.restore();
      ctx.font = "bold 28px Cairo";
      ctx.fillStyle = "#333";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('569', width/2, height/2 - 10);
      ctx.font = "14px Cairo";
      ctx.fillStyle = "#777";
      ctx.fillText('Total Patient', width/2, height/2 + 15);
      ctx.save();
    }
  }]
});
// رسومات صغيرة داخل الكروت (Sparkline Charts)
new Chart(document.getElementById('doctorsChart'), {
  type: 'bar',
  data: {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [35, 48, 42, 55, 60, 72],
      backgroundColor: '#14a2a0',
      borderRadius: 4,
      barThickness: 8
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
});

new Chart(document.getElementById('patientsChart'), {
  type: 'line',
  data: {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [80, 65, 90, 75, 95, 110],
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 0
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
});

new Chart(document.getElementById('appointmentsChart'), {
  type: 'bar',
  data: {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [90, 105, 98, 120, 135, 160],
      backgroundColor: '#4cae4c',
      borderRadius: 4,
      barThickness: 8
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
});
// Sparkline Charts للـ Appointment Report
new Chart(document.getElementById('totalAppChart'), { type: 'bar', data: { datasets: [{ data: [300,350,320,400,380,450,500], backgroundColor: '#4a90e2', borderRadius: 4 }] }, options: { responsive:true, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}} } });

new Chart(document.getElementById('completedChart'), { type: 'bar', data: { datasets: [{ data: [280,320,300,380,360,420,450], backgroundColor: '#2ecc71', borderRadius: 4 }] }, options: { responsive:true, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}} } });

new Chart(document.getElementById('cancelledChart'), { type: 'bar', data: { datasets: [{ data: [30,35,32,40,38,45,50], backgroundColor: '#f1c40f', borderRadius: 4 }] }, options: { responsive:true, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}} } });

new Chart(document.getElementById('rescheduledChart'), { type: 'bar', data: { datasets: [{ data: [20,18,22,15,25,20,18], backgroundColor: '#e74c3c', borderRadius: 4 }] }, options: { responsive:true, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}} } });
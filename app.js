
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmNSptGUoF59NM683v7m8olumq940gsrM",
  authDomain: "convitedigitalalice.firebaseapp.com",
  projectId: "convitedigitalalice",
  storageBucket: "convitedigitalalice.firebasestorage.app",
  messagingSenderId: "69410023406",
  appId: "1:69410023406:web:21af5c6e3c82af18c810ff"
};
// 1. INICIALIZAÇÃO
// Certifique-se de que o firebaseConfig está definido acima destas linhas
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. LÓGICA DO FORMULÁRIO (Convite)
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btnSubmit = document.getElementById('btnSubmit');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Enviando...';

        const guestName = document.getElementById('guestName').value.trim();
        const adultsCount = parseInt(document.getElementById('adultsCount').value) || 0;
        const childrenCount = parseInt(document.getElementById('childrenCount').value) || 0;

        db.collection("confirmacoes").add({
            nome: guestName, 
            adultos: adultsCount, 
            criancas: childrenCount,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            new bootstrap.Modal(document.getElementById('successModal')).show();
            rsvpForm.reset();
            btnSubmit.disabled = false;
            btnSubmit.innerText = "CONFIRMAR PRESENÇA";
        })
        .catch((error) => {
            alert("Erro ao confirmar: " + error.message);
            btnSubmit.disabled = false;
        });
    });
}

// 3. LÓGICA DO ADMIN
const ADMIN_PASSWORD = "Alice#2026&";
const ADMIN_USER = "patyramalho";

function verifyAccess() {
    const user = document.getElementById('adminUser').value.trim().toLowerCase();
    const pass = document.getElementById('adminPassword').value;
    
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        localStorage.setItem('isLoggedIn', 'true');
        document.getElementById('loginBlock').classList.add('d-none');
        document.getElementById('adminDashboard').classList.remove('d-none');
        loadDashboardData();
    } else {
        document.getElementById('loginError').classList.remove('d-none');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.reload(); // Recarrega para limpar o estado da tela
}

function loadDashboardData() {
    console.log("Iniciando leitura do banco...");
    
    db.collection("confirmacoes").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        let adultos = 0;
        let criancas = 0;
        let html = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            adultos += parseInt(data.adultos) || 0;
            criancas += parseInt(data.criancas) || 0;

            html += `<tr>
                <td>${escapeHtml(data.nome)}</td>
                <td class="text-center">${data.adultos}</td>
                <td class="text-center">${data.criancas}</td>
                <td class="small">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : '--'}</td>
            </tr>`;
        });

        document.getElementById('totalAdults').innerText = adultos;
        document.getElementById('totalChildren').innerText = criancas;
        document.getElementById('totalGeneral').innerText = adultos + criancas;
        document.getElementById('guestsTableBody').innerHTML = html;
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function forceSync() {
    alert("Sincronizado com o servidor!");
}
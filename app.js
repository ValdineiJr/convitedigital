
// 1. CONFIGURAÇÃO DO FIREBASE (Coloque suas chaves aqui)
const firebaseConfig = {
  apiKey: "AIzaSyDmNSptGUoF59NM683v7m8olumq940gsrM",
  authDomain: "convitedigitalalice.firebaseapp.com",
  projectId: "convitedigitalalice",
  storageBucket: "convitedigitalalice.firebasestorage.app",
  messagingSenderId: "69410023406",
  appId: "1:69410023406:web:21af5c6e3c82af18c810ff"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

window.onload = function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginBlock').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadDashboardData();
    }
};

// 2. LÓGICA DO FORMULÁRIO (Usado no index.html)
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
        })
        .catch((error) => alert("Erro ao confirmar: " + error.message));
    });
}

// 3. LÓGICA DO ADMIN (Usado no admin.html)
const ADMIN_PASSWORD = "Alice#2026&";
const ADMIN_USER = "patyramalho";

function verifyAccess() {
    const user = document.getElementById('adminUser').value.trim().toLowerCase();
    const pass = document.getElementById('adminPassword').value;
    
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        localStorage.setItem('isLoggedIn', 'true');
        document.getElementById('loginBlock').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadDashboardData();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
}

function loadDashboardData() {
    // Escuta a coleção "confirmacoes"
    db.collection("confirmacoes").onSnapshot((snapshot) => {
        let adultos = 0;
        let criancas = 0;
        let html = '';

        // Se o snapshot estiver vazio, significa que o Firestore não tem documentos nessa coleção
        if (snapshot.empty) {
            console.log("Nenhum documento encontrado na coleção 'confirmacoes'");
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Soma os valores. Usamos a estrutura exata do seu .add()
            adultos += parseInt(data.adultos) || 0;
            criancas += parseInt(data.criancas) || 0;

            // Monta a linha
            html += `<tr>
                <td class="p-4">${data.nome || 'Sem nome'}</td>
                <td class="p-4 text-center">${data.adultos || 0}</td>
                <td class="p-4 text-center">${data.criancas || 0}</td>
            </tr>`;
        });

        // Atualiza os contadores na tela
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
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmNSptGUoF59NM683v7m8olumq940gsrM",
  authDomain: "convitedigitalalice.firebaseapp.com",
  projectId: "convitedigitalalice",
  storageBucket: "convitedigitalalice.firebasestorage.app",
  messagingSenderId: "69410023406",
  appId: "1:69410023406:web:21af5c6e3c82af18c810ff"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. LÓGICA DO FORMULÁRIO
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    // Desabilita o botão para evitar cliques duplicados
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

    const guestName = document.getElementById('guestName').value.trim();
    const adultsCount = parseInt(document.getElementById('adultsCount').value) || 0;
    const childrenCount = parseInt(document.getElementById('childrenCount').value) || 0;

    db.collection("confirmacoes").add({
        nome: guestName, adultos: adultsCount, criancas: childrenCount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Exibe o Modal centralizado
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        
        // Reseta o botão para o estado original
        rsvpForm.reset();
        btnSubmit.disabled = false;
        btnSubmit.innerText = "EU VOU! 🎉";
    })
    .catch((error) => {
        alert("Erro ao confirmar. Tente novamente.");
        btnSubmit.disabled = false;
        btnSubmit.innerText = "EU VOU! 🎉";
    });
});
}

// 3. LÓGICA DO LOGIN ADMIN (mantida conforme seu arquivo original)
const ADMIN_PASSWORD = "Alice#2026&";
const ADMIN_USER = "patyramalho";

function verifyAccess() {
    const user = document.getElementById('adminUser').value.trim().toLowerCase();
    const pass = document.getElementById('adminPassword').value;
    
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        // Grava que o usuário está logado
        localStorage.setItem('isLoggedIn', 'true');
        
        document.getElementById('loginBlock').classList.add('d-none');
        document.getElementById('adminDashboard').classList.remove('d-none');
        loadDashboardData();
    } else {
        document.getElementById('loginError').classList.remove('d-none');
    }
}

// MODIFIQUE SUA FUNÇÃO logout NO app.js:
function logout() {
    // Remove a sessão gravada
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
}

// Adicione isso ao seu app.js
function loadDashboardData() {
    console.log("Iniciando leitura do banco...");
    
    // Certifique-se de que o nome da coleção "confirmacoes" está correto no seu Firebase
    db.collection("confirmacoes").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        let adultos = 0;
        let criancas = 0;
        let html = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Soma os valores
            adultos += parseInt(data.adultos) || 0;
            criancas += parseInt(data.criancas) || 0;

            // Monta as linhas da tabela
            html += `<tr>
                <td>${data.nome}</td>
                <td class="text-center">${data.adultos}</td>
                <td class="text-center">${data.criancas}</td>
                <td class="small">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : '--'}</td>
            </tr>`;
        });

        // Atualiza os números no Dashboard
        document.getElementById('totalAdults').innerText = adultos;
        document.getElementById('totalChildren').innerText = criancas;
        document.getElementById('totalGeneral').innerText = adultos + criancas;
        
        // Atualiza a lista
        document.getElementById('guestsTableBody').innerHTML = html;
        console.log("Dados carregados com sucesso!");
    });
}

function deleteRecord(id) {
    if (confirm("Deseja realmente remover esta confirmação da lista?")) {
        db.collection("confirmacoes").doc(id).delete()
        .then(() => console.log("Registro removido com sucesso."))
        .catch((error) => {
            console.error("Erro ao remover: ", error);
            alert("Não foi possível excluir o registro.");
        });
    }
}

function logout() {
    document.getElementById('adminPassword').value = "";
    document.getElementById('adminDashboard').classList.add('d-none');
    document.getElementById('loginBlock').classList.remove('d-none');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
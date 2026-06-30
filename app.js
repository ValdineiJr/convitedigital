// 1. CONFIGURAÇÃO (Seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyDmNSptGUoF59NM683v7m8olumq940gsrM",
  authDomain: "convitedigitalalice.firebaseapp.com",
  projectId: "convitedigitalalice",
  storageBucket: "convitedigitalalice.firebasestorage.app",
  messagingSenderId: "69410023406",
  appId: "1:69410023406:web:21af5c6e3c82af18c810ff"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 2. LÓGICA DO FORMULÁRIO (Usado no seu index.html)
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Garante que pegamos os valores corretamente
        const nome = document.getElementById('guestName').value.trim();
        const adultos = parseInt(document.getElementById('adultsCount').value) || 0;
        const criancas = parseInt(document.getElementById('childrenCount').value) || 0;

        // GRAVAÇÃO NO BANCO
        db.collection("confirmacoes").add({
            nome: nome,
            adultos: adultos,
            criancas: criancas,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Se o bootstrap estiver carregado, mostra o modal
            if(window.bootstrap) {
                new bootstrap.Modal(document.getElementById('successModal')).show();
            }
            rsvpForm.reset();
        })
        .catch(err => console.error("Erro ao gravar:", err));
    });
}

// 3. LÓGICA DO PAINEL ADMIN (Leitura e Soma)
function loadDashboardData() {
    console.log("Conectando ao banco de dados...");
    
    // Ouve a coleção "confirmacoes" em tempo real
    db.collection("confirmacoes").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        let totalAdultos = 0;
        let totalCriancas = 0;
        let rows = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Soma os valores
            totalAdultos += parseInt(data.adultos || 0);
            totalCriancas += parseInt(data.criancas || 0);

            // Cria a linha da tabela
            rows += `<tr>
                <td class="p-4">${data.nome || 'Anônimo'}</td>
                <td class="p-4 text-center">${data.adultos || 0}</td>
                <td class="p-4 text-center">${data.criancas || 0}</td>
            </tr>`;
        });

        // Atualiza a tela (protegido contra erros de elemento nulo)
        const elA = document.getElementById('totalAdults');
        const elC = document.getElementById('totalChildren');
        const elT = document.getElementById('totalGeneral');
        const elTable = document.getElementById('guestsTableBody');

        if(elA) elA.innerText = totalAdultos;
        if(elC) elC.innerText = totalCriancas;
        if(elT) elT.innerText = totalAdultos + totalCriancas;
        if(elTable) elTable.innerHTML = rows;
        
        console.log("Painel atualizado!");
    });
}

// 4. LÓGICA DE LOGIN
function verifyAccess() {
    const user = document.getElementById('adminUser').value.trim().toLowerCase();
    const pass = document.getElementById('adminPassword').value;
    
    if (user === "patyramalho" && pass === "Alice#2026&") {
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

// Mantém o painel logado se a página for recarregada
window.onload = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const dbPanel = document.getElementById('adminDashboard');
        const loginBlock = document.getElementById('loginBlock');
        if(dbPanel) dbPanel.classList.remove('hidden');
        if(loginBlock) loginBlock.classList.add('hidden');
        loadDashboardData();
    }
};
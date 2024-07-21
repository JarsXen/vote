const validUsers = [
    { userId: 'user1', password: 'pass1' },
    { userId: 'user2', password: 'pass2' },
    { userId: 'user3', password: 'pass3' },
    // Add more users as needed
];

const adminUser = { userId: 'admin', password: 'adminpass' };

const votedUsers = new Set();

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.classList.add('fadeOut');
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.classList.remove('fadeOut');
        }, 1000);
    }, 2000);
}

function login() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    if (userId === adminUser.userId && password === adminUser.password) {
        showMessage('Login admin berhasil!', 'successMessage');
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        document.getElementById('logoutButtonAdmin').style.display = 'block';
        populateAdminTable();
        return;
    }

    const user = validUsers.find(u => u.userId === userId);

    if (!user) {
        showMessage('User ID tidak terdaftar, silahkan menggunakan User ID yang benar!', 'errorMessage');
        return;
    }

    if (user.password !== password) {
        showMessage('Password salah!', 'errorMessage');
        return;
    }

    if (votedUsers.has(userId)) {
        showMessage('Anda sudah memberikan vote!', 'errorMessage');
        return;
    }

    sessionStorage.setItem('loggedInUser', userId);
    showMessage('Login berhasil!', 'successMessage');
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('voteContainer').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
}

function vote() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const selectedCandidate = document.querySelector('input[name="candidate"]:checked');

    if (!loggedInUser || !selectedCandidate) {
        showMessage('Silahkan login dan pilih kandidat untuk vote!', 'errorMessage');
        return;
    }

    if (votedUsers.has(loggedInUser)) {
        showMessage('Anda sudah memberikan vote!', 'errorMessage');
        return;
    }

    votedUsers.add(loggedInUser);
    sessionStorage.setItem(loggedInUser, selectedCandidate.value);
    showMessage('Vote berhasil!', 'successMessage');
    document.querySelectorAll('input[name="candidate"]').forEach(input => input.disabled = true);
    updateResults();
}

function logout() {
    showMessage('Anda telah keluar!', 'logoutMessage');
    document.getElementById('voteContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
    sessionStorage.removeItem('loggedInUser');
    document.getElementById('logoutButton').style.display = 'none';
    document.querySelectorAll('input[name="candidate"]').forEach(input => input.disabled = false);
}

function logoutAdmin() {
    showMessage('Admin telah keluar!', 'logoutMessage');
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
    sessionStorage.removeItem('loggedInAdmin');
    document.getElementById('logoutButtonAdmin').style.display = 'none';
}

function updateResults() {
    const resultsDiv = document.getElementById('results');
    const candidateVotes = { 'Candidate 1': 0, 'Candidate 2': 0, 'Candidate 3': 0 };

    validUsers.forEach(user => {
        const vote = sessionStorage.getItem(user.userId);
        if (vote) candidateVotes[vote]++;
    });

    resultsDiv.innerHTML = `
        <p>Candidate 1: ${candidateVotes['Candidate 1']} votes</p>
        <p>Candidate 2: ${candidateVotes['Candidate 2']} votes</p>
        <p>Candidate 3: ${candidateVotes['Candidate 3']} votes</p>
    `;
}

function populateAdminTable() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    validUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${votedUsers.has(user.userId) ? 'Yes' : 'No'}</td>
        `;
        userList.appendChild(row);
    });
}

function addUser() {
    const userId = document.getElementById('newUserId').value;
    const password = document.getElementById('newPassword').value;

    if (validUsers.find(u => u.userId === userId)) {
        showMessage('User ID sudah ada!', 'errorMessage');
        return;
    }

    if (userId && password) {
        validUsers.push({ userId, password });
        showMessage('User berhasil ditambahkan!', 'successMessage');
        populateAdminTable();
        document.getElementById('newUserId').value = '';
        document.getElementById('newPassword').value = '';
    } else {
        showMessage('Harap isi semua field!', 'errorMessage');
    }
}

function deleteUser() {
    const userId = document.getElementById('deleteUserId').value;

    const userIndex = validUsers.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
        validUsers.splice(userIndex, 1);
        votedUsers.delete(userId);
        sessionStorage.removeItem(userId);
        showMessage('User berhasil dihapus!', 'successMessage');
        populateAdminTable();
        document.getElementById('deleteUserId').value = '';
    } else {
        showMessage('User ID tidak ditemukan!', 'errorMessage');
    }
}

function resetVotes() {
    votedUsers.clear();
    validUsers.forEach(user => sessionStorage.removeItem(user.userId));
    showMessage('Semua voting telah direset!', 'successMessage');
    updateResults();
}

function detectFraud() {
    const resultsDiv = document.getElementById('results');
    let fraudDetected = false;
    
    validUsers.forEach(user => {
        if (votedUsers.has(user.userId) && !sessionStorage.getItem(user.userId)) {
            fraudDetected = true;
        }
    });
    
    if (fraudDetected) {
        showMessage('Kecurangan voting terdeteksi!', 'errorMessage');
    } else {
        showMessage('Tidak ada kecurangan voting.', 'successMessage');
    }
    updateResults();
}

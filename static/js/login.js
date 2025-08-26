// Inisialisasi Firebase dengan kode konfigurasi Anda
const firebaseConfig = {
    apiKey: "AIzaSyChbJQ6hJKhAlgol_tQo-frKe5ptMlysbg",
    authDomain: "whyd01.firebaseapp.com",
    projectId: "whyd01",
    storageBucket: "whyd01.firebasestorage.app",
    messagingSenderId: "197341337130",
    appId: "1:197341337130:web:737441783fbf6265de5553",
    measurementId: "G-MQ93XKTGDY"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Dapatkan referensi elemen HTML
const authForm = document.getElementById('authForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const messageElement = document.getElementById('message');

// Logika untuk tombol LOGIN
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;

    messageElement.textContent = "Loading...";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            messageElement.textContent = `Login berhasil! Selamat datang, ${user.email}.`;
            console.log("Pengguna berhasil login:", user);
            window.location.href = "/";
        })
        .catch((error) => {
            const errorMessage = error.message;
            messageElement.textContent = `Login gagal: ${errorMessage}`;
            console.error("Login gagal:", error);
        });
});

// ---

// Logika untuk tombol DAFTAR
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    messageElement.textContent = "Loading...";

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            messageElement.textContent = `Daftar berhasil! Akun ${user.email} telah dibuat. Silakan login.`;
            console.log("Akun Baru Berhasil:", user);
        })
        .catch((error) => {
            const errorMessage = error.message;
            messageElement.textContent = `Daftar gagal: ${errorMessage}`;
            console.error("Daftar gagal:", error);
        });
});

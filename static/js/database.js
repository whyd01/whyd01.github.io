// firebase
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
const firestore = firebase.firestore();

let user;

// Ini adalah bagian TERPENTING:
// Menunggu hingga status autentikasi berubah dan menetapkan variabel 'user'
auth.onAuthStateChanged((loggedInUser) => {
    if (loggedInUser) {
        // Pengguna berhasil login (atau login secara anonim)
        user = loggedInUser;
        console.log("Pengguna terautentikasi:", user.uid);
    } else {
        // Pengguna tidak login, coba login secara anonim
        auth.signInAnonymously().catch((error) => {
            console.error("Gagal login anonim:", error);
        });
    }
});

// --- FUNGSI SAVE KE LIBRARY ---
// Pastikan fungsi ini tetap berada di sini agar bisa diakses oleh file lain
const saveToLibrary = (song) => {
    if (!user) {
        alert("Anda harus login untuk menyimpan lagu!");
        console.error("Gagal menyimpan: Pengguna tidak terautentikasi.");
        return;
    }
    const userDocRef = firestore.collection('users').doc(user.uid);
    const songDocRef = userDocRef.collection('library').doc(song.id); // Menggunakan ID yang unik
    
    songDocRef.set(song)
        .then(() => {
            console.log("Lagu berhasil disimpan ke library!");
            alert("Lagu berhasil disimpan!");
        })
        .catch((error) => {
            console.error("Gagal menyimpan lagu:", error);
            alert("Gagal menyimpan lagu!");
        });
};

// --- FUNGSI LOAD DARI LIBRARY ---
const loadLibrary = () => {
    if (!user) {
        alert("Anda harus login untuk melihat library!");
        console.error("Gagal memuat: Pengguna tidak terautentikasi.");
        return;
    }
    // Dapatkan referensi wadah baru yang sudah kita buat
    const libraryGrid = document.getElementById('library-grid');
    libraryGrid.innerHTML = '<h2>Library Anda</h2>'; // Tambahkan judul

    firestore.collection('users').doc(user.uid).collection('library').get()
        .then((snapshot) => {
            const songs = [];
            snapshot.forEach(doc => {
                songs.push(doc.data());
            });
            // Gunakan fungsi displaySongs yang sudah diperbarui
            displaySongs(songs, libraryGrid);
            console.log("Library berhasil dimuat!");
        })
        .catch((error) => {
            console.error("Gagal memuat library:", error);
        });
};

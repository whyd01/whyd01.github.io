// --- SCRIPT KHUSUS UNTUK POPUP GALERI TERSIMPAN ---
const savedGalleryModal = document.getElementById('saved-gallery-modal');
const savedGalleryContainer = document.getElementById('saved-gallery-container');
const closeGalleryModalBtn = document.getElementById('close-gallery-modal-btn');
const profileMenu = document.getElementById('profile-menu');

// Buat tombol baru "Koleksi Tersimpan" di dropdown
const galleryOption = document.createElement('a');
galleryOption.href = '#';
galleryOption.classList.add('dropdown-item');
galleryOption.textContent = 'Koleksi';
profileMenu.insertBefore(galleryOption, profileMenu.querySelector('#settings-btn'));

// Fungsi untuk memuat dan menampilkan gambar
function loadSavedImages() {
    const savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];

    if (savedImages.length === 0) {
        savedGalleryContainer.innerHTML = '<p class="empty-message">Kamu belum menyimpan gambar apa pun. 😢</p>';
        return;
    }

    savedGalleryContainer.innerHTML = '';
    savedImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;
        
        card.appendChild(img);
        savedGalleryContainer.appendChild(card);
    });
}

// Event listener untuk tombol "Koleksi Tersimpan"
galleryOption.addEventListener('click', function(e) {
    e.preventDefault();
    profileMenu.classList.remove('show');
    savedGalleryModal.style.display = 'flex';
    loadSavedImages();
});

// Event listener untuk tombol tutup modal galeri
closeGalleryModalBtn.addEventListener('click', function() {
    savedGalleryModal.style.display = 'none';
});

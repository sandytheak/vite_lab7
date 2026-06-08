// Імпортуємо бібліотеки та їх стилі
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// Знаходимо елементи DOM
const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');

// КЛЮЧ API ВІД PIXABAY
const API_KEY = 'XXX'; 

// Ініціалізуємо бібліотеку SimpleLightbox один раз
const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

// Слухач події на відправку форми
form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Отримуємо та очищаємо рядок від пробілів
    const searchQuery = form.elements.query.value.trim();

    // Перевірка на порожній рядок
    if (!searchQuery) {
        iziToast.warning({
            title: 'Caution',
            message: 'Please enter a search word!',
            position: 'topRight'
        });
        return;
    }

    // Очищаємо попередню галерею і показуємо лоадер
    gallery.innerHTML = '';
    loader.style.display = 'block';

    // Формуємо URL запиту з усіма параметрами з ТЗ
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&safesearch=true`;

    // Виконуємо HTTP-запит
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            // Ховаємо лоадер після отримання відповіді
            loader.style.display = 'none';

            // Якщо нічого не знайдено
            if (data.hits.length === 0) {
                iziToast.error({
                    title: 'Error',
                    message: "Sorry, there are no images matching your search query. Please try again!",
                    position: 'topRight'
                });
                return;
            }

            // Якщо знайшли — рендеримо розмітку
            renderGallery(data.hits);
            
            // Оновлюємо SimpleLightbox, щоб він побачив нові картинки
            lightbox.refresh();
        })
        .catch(error => {
            loader.style.display = 'none';
            iziToast.error({
                title: 'Error',
                message: `Something went wrong: ${error.message}`,
                position: 'topRight'
            });
        });
        
    // Очищаємо поле вводу
    form.reset();
});

// Функція для генерації розмітки карток
function renderGallery(images) {
    const markup = images.map(img => `
        <li class="gallery-item">
            <a class="gallery-link" href="${img.largeImageURL}">
                <img 
                    class="gallery-image" 
                    src="${img.webformatURL}" 
                    alt="${img.tags}" 
                />
            </a>
            <div class="info">
                <div class="info-item">
                    <b>Likes</b>
                    <span>${img.likes}</span>
                </div>
                <div class="info-item">
                    <b>Views</b>
                    <span>${img.views}</span>
                </div>
                <div class="info-item">
                    <b>Comments</b>
                    <span>${img.comments}</span>
                </div>
                <div class="info-item">
                    <b>Downloads</b>
                    <span>${img.downloads}</span>
                </div>
            </div>
        </li>
    `).join('');
    
    gallery.insertAdjacentHTML('beforeend', markup);
}
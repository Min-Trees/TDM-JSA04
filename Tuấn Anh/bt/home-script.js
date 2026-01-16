const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentFilters = {
    genre: '',
    year: '',
    sort: 'popularity.desc',
    search: ''
};

// Check login status
const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn || !currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('username').textContent = currentUser;
}

// Scroll navbar effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Navigate to profile
function goToProfile() {
    window.location.href = 'profile.html';
}

// Fetch genres
async function fetchGenres() {
    try {
        const response = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}`);
        const data = await response.json();
        const genreSelect = document.getElementById('genreFilter');
        
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

// Populate year filter
function populateYearFilter() {
    const yearSelect = document.getElementById('yearFilter');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Fetch movies
async function fetchMovies(page = 1) {
    const container = document.getElementById('moviesContainer');
    container.innerHTML = '<div class="loading">Loading movies...</div>';

    try {
        let url = '';
        
        if (currentFilters.search) {
            url = `${API_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentFilters.search)}&page=${page}`;
        } else {
            url = `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=${currentFilters.sort}&page=${page}`;
            
            if (currentFilters.genre) {
                url += `&with_genres=${currentFilters.genre}`;
            }
            if (currentFilters.year) {
                url += `&primary_release_year=${currentFilters.year}`;
            }
        }

        const response = await fetch(url);
        const data = await response.json();
        
        displayMovies(data.results);
        displayPagination(data.page, data.total_pages);
    } catch (error) {
        console.error('Error fetching movies:', error);
        container.innerHTML = '<div class="loading">Error loading movies. Please try again.</div>';
    }
}

// Display movies
function displayMovies(movies) {
    const container = document.getElementById('moviesContainer');
    
    if (movies.length === 0) {
        container.innerHTML = '<div class="loading">No movies found.</div>';
        return;
    }

    container.innerHTML = '';
    container.className = 'movies-grid';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => showMovieDetail(movie.id);

        const posterUrl = movie.poster_path 
            ? `${IMG_BASE}${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300?text=No+Poster';

        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                    <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                </div>
            </div>
        `;

        container.appendChild(movieCard);
    });
}

// Display pagination
function displayPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const maxPages = Math.min(totalPages, 500); // TMDB limit

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    const pagesToShow = [];
    if (maxPages <= 7) {
        for (let i = 1; i <= maxPages; i++) {
            pagesToShow.push(i);
        }
    } else {
        if (currentPage <= 4) {
            pagesToShow.push(1, 2, 3, 4, 5, '...', maxPages);
        } else if (currentPage >= maxPages - 3) {
            pagesToShow.push(1, '...', maxPages - 4, maxPages - 3, maxPages - 2, maxPages - 1, maxPages);
        } else {
            pagesToShow.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', maxPages);
        }
    }

    pagesToShow.forEach(page => {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        if (page === currentPage) {
            pageBtn.classList.add('active');
        }
        
        if (page === '...') {
            pageBtn.textContent = '...';
            pageBtn.disabled = true;
        } else {
            pageBtn.textContent = page;
            pageBtn.onclick = () => changePage(page);
        }
        
        pagination.appendChild(pageBtn);
    });

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage === maxPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// Change page
function changePage(page) {
    currentPage = page;
    fetchMovies(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show movie detail
function showMovieDetail(movieId) {
    // Store movie ID and navigate to detail page
    localStorage.setItem('selectedMovieId', movieId);
    window.location.href = 'movie-detail.html';
}

// Filter change handlers
document.getElementById('genreFilter').addEventListener('change', (e) => {
    currentFilters.genre = e.target.value;
    currentPage = 1;
    fetchMovies(1);
});

document.getElementById('yearFilter').addEventListener('change', (e) => {
    currentFilters.year = e.target.value;
    currentPage = 1;
    fetchMovies(1);
});

document.getElementById('sortFilter').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    currentPage = 1;
    fetchMovies(1);
});

// Search with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentFilters.search = e.target.value;
        currentPage = 1;
        fetchMovies(1);
    }, 500);
});

// Initialize
fetchGenres();
populateYearFilter();
fetchMovies(1);
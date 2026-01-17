const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const IMG_BASE_LARGE = 'https://image.tmdb.org/t/p/original';

// Check login status
const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn || !currentUser) {
    window.location.href = 'index.html';
}

// Get movie ID from localStorage
const movieId = localStorage.getItem('selectedMovieId');

if (!movieId) {
    window.location.href = 'home.html';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Get user's favorites
function getUserFavorites() {
    const favorites = localStorage.getItem(`favorites_${currentUser}`);
    return favorites ? JSON.parse(favorites) : [];
}

// Check if movie is in favorites
function isFavorite(movieId) {
    const favorites = getUserFavorites();
    return favorites.includes(movieId);
}

// Toggle favorite
function toggleFavorite(movieId) {
    let favorites = getUserFavorites();
    const index = favorites.indexOf(movieId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        favorites.push(movieId);
        showNotification('Added to favorites ❤️', 'success');
    }
    
    localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites));
    updateFavoriteButton(movieId);
}

// Update favorite button
function updateFavoriteButton(movieId) {
    const btn = document.getElementById('favoriteBtn');
    if (btn) {
        if (isFavorite(movieId)) {
            btn.innerHTML = '❤️ Remove from Favorites';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '🤍 Add to Favorites';
            btn.classList.remove('active');
        }
    }
}

// Add to watched history
function addToWatched(movieId) {
    let watched = localStorage.getItem(`watched_${currentUser}`);
    watched = watched ? JSON.parse(watched) : [];
    
    // Remove if already exists
    watched = watched.filter(id => id !== movieId);
    
    // Add to beginning
    watched.push(movieId);
    
    // Keep only last 50 watched movies
    if (watched.length > 50) {
        watched = watched.slice(-50);
    }
    
    localStorage.setItem(`watched_${currentUser}`, JSON.stringify(watched));
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Fetch movie details
async function fetchMovieDetails() {
    try {
        // Fetch movie details
        const movieResponse = await fetch(
            `${API_BASE}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,similar`
        );
        const movieData = await movieResponse.json();

        // Add to watched history
        addToWatched(parseInt(movieId));

        displayMovieDetails(movieData);
        updateFavoriteButton(parseInt(movieId));
    } catch (error) {
        console.error('Error fetching movie details:', error);
        document.getElementById('movieDetail').innerHTML = 
            '<div class="loading">Error loading movie details. Please try again.</div>';
    }
}

// Display movie details
function displayMovieDetails(movie) {
    const container = document.getElementById('movieDetail');
    
    const backdropUrl = movie.backdrop_path 
        ? `${IMG_BASE_LARGE}${movie.backdrop_path}` 
        : 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
    
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE}${movie.poster_path}` 
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    // Format runtime
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    const runtime = `${hours}h ${minutes}m`;

    // Format budget and revenue
    const formatMoney = (amount) => {
        if (amount === 0) return 'N/A';
        return `$${(amount / 1000000).toFixed(1)}M`;
    };

    container.innerHTML = `
        <!-- Hero Section -->
        <div class="movie-hero" style="background-image: url('${backdropUrl}')">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="movie-title">${movie.title}</h1>
                <div class="movie-meta-info">
                    <span class="rating-badge">⭐ ${movie.vote_average.toFixed(1)}</span>
                    <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                    <span>${runtime}</span>
                </div>
                <div class="genre-tags">
                    ${movie.genres.map(genre => 
                        `<span class="genre-tag">${genre.name}</span>`
                    ).join('')}
                </div>
                <p class="movie-overview">${movie.overview || 'No overview available.'}</p>
                <button id="favoriteBtn" class="btn-favorite" onclick="toggleFavorite(${movie.id})">
                    🤍 Add to Favorites
                </button>
            </div>
        </div>

        <!-- Details Section -->
        <div class="movie-details">
            <div class="details-grid">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster-large">
                
                <div class="details-info">
                    <div class="info-row">
                        <div class="info-label">Original Title</div>
                        <div class="info-value">${movie.original_title}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Status</div>
                        <div class="info-value">${movie.status}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Release Date</div>
                        <div class="info-value">${movie.release_date || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Runtime</div>
                        <div class="info-value">${runtime}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Budget</div>
                        <div class="info-value">${formatMoney(movie.budget)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Revenue</div>
                        <div class="info-value">${formatMoney(movie.revenue)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Vote Count</div>
                        <div class="info-value">${movie.vote_count.toLocaleString()} votes</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Original Language</div>
                        <div class="info-value">${movie.original_language.toUpperCase()}</div>
                    </div>
                    ${movie.production_companies.length > 0 ? `
                    <div class="info-row">
                        <div class="info-label">Production</div>
                        <div class="info-value">
                            ${movie.production_companies.map(c => c.name).join(', ')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Cast Section -->
            ${movie.credits && movie.credits.cast.length > 0 ? `
            <div class="cast-section">
                <h2 class="section-title">Top Cast</h2>
                <div class="cast-grid">
                    ${movie.credits.cast.slice(0, 12).map(actor => {
                        const photoUrl = actor.profile_path 
                            ? `${IMG_BASE}${actor.profile_path}` 
                            : 'https://via.placeholder.com/200x300?text=No+Photo';
                        return `
                            <div class="cast-card">
                                <img src="${photoUrl}" alt="${actor.name}" class="cast-photo">
                                <div class="cast-info">
                                    <div class="cast-name">${actor.name}</div>
                                    <div class="cast-character">${actor.character}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Similar Movies Section -->
            ${movie.similar && movie.similar.results.length > 0 ? `
            <div class="similar-movies-section">
                <h2 class="section-title">Similar Movies</h2>
                <div class="similar-movies-grid">
                    ${movie.similar.results.slice(0, 12).map(similar => {
                        const similarPosterUrl = similar.poster_path 
                            ? `${IMG_BASE}${similar.poster_path}` 
                            : 'https://via.placeholder.com/200x300?text=No+Poster';
                        return `
                            <div class="similar-movie-card" onclick="viewMovie(${similar.id})">
                                <img src="${similarPosterUrl}" alt="${similar.title}" class="similar-movie-poster">
                                <div class="similar-movie-info">
                                    <div class="similar-movie-title">${similar.title}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// View another movie
function viewMovie(movieId) {
    localStorage.setItem('selectedMovieId', movieId);
    window.location.reload();
}

// Initialize
fetchMovieDetails();
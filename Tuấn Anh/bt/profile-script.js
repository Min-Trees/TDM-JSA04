const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// Check login status
const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn || !currentUser) {
    window.location.href = 'index.html';
}

// Get user data
const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Load profile data
function loadProfileData() {
    // Set profile info
    document.getElementById('profileUsername').textContent = userData.username;
    document.getElementById('profileEmail').textContent = userData.email;
    
    // Set avatar initial
    const initial = userData.username.charAt(0).toUpperCase();
    document.getElementById('avatarInitial').textContent = initial;
    
    // Format joined date
    const joinedDate = new Date(userData.createdAt);
    document.getElementById('joinedDate').textContent = joinedDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    // Load favorites and watched movies
    loadFavoriteMovies();
    loadWatchedMovies();
    updateStatistics();
}

// Get user's favorite movies
function getUserFavorites() {
    const favorites = localStorage.getItem(`favorites_${currentUser}`);
    return favorites ? JSON.parse(favorites) : [];
}

// Get user's watched movies
function getUserWatched() {
    const watched = localStorage.getItem(`watched_${currentUser}`);
    return watched ? JSON.parse(watched) : [];
}

// Load favorite movies
async function loadFavoriteMovies() {
    const favorites = getUserFavorites();
    const container = document.getElementById('favoritesGrid');
    document.getElementById('favoritesCount').textContent = `${favorites.length} movies`;
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>You haven't added any favorite movies yet.</p>
                <button class="btn-browse" onclick="window.location.href='home.html'">Browse Movies</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    for (const movieId of favorites) {
        try {
            const response = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}`);
            const movie = await response.json();
            
            const movieCard = createMovieCard(movie, 'favorite');
            container.appendChild(movieCard);
        } catch (error) {
            console.error('Error loading movie:', error);
        }
    }
}

// Load watched movies
async function loadWatchedMovies() {
    const watched = getUserWatched();
    const container = document.getElementById('watchedGrid');
    document.getElementById('watchedCount').textContent = `${watched.length} movies`;
    
    if (watched.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No watch history yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Show only last 12 watched movies
    const recentWatched = watched.slice(-12).reverse();
    
    for (const movieId of recentWatched) {
        try {
            const response = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}`);
            const movie = await response.json();
            
            const movieCard = createMovieCard(movie, 'watched');
            container.appendChild(movieCard);
        } catch (error) {
            console.error('Error loading movie:', error);
        }
    }
}

// Create movie card
function createMovieCard(movie, type) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE}${movie.poster_path}` 
        : 'https://via.placeholder.com/200x300?text=No+Poster';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-meta">
                <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                <span>⭐ ${movie.vote_average.toFixed(1)}</span>
            </div>
        </div>
        <button class="remove-btn" onclick="removeMovie(${movie.id}, '${type}')">×</button>
    `;
    
    card.onclick = (e) => {
        if (!e.target.classList.contains('remove-btn')) {
            viewMovie(movie.id);
        }
    };
    
    return card;
}

// Remove movie from favorites or watched
function removeMovie(movieId, type) {
    event.stopPropagation();
    
    if (type === 'favorite') {
        let favorites = getUserFavorites();
        favorites = favorites.filter(id => id !== movieId);
        localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(favorites));
        loadFavoriteMovies();
    } else if (type === 'watched') {
        let watched = getUserWatched();
        watched = watched.filter(id => id !== movieId);
        localStorage.setItem(`watched_${currentUser}`, JSON.stringify(watched));
        loadWatchedMovies();
    }
    
    updateStatistics();
}

// View movie detail
function viewMovie(movieId) {
    localStorage.setItem('selectedMovieId', movieId);
    window.location.href = 'movie-detail.html';
}

// Update statistics
async function updateStatistics() {
    const favorites = getUserFavorites();
    const watched = getUserWatched();
    
    document.getElementById('totalFavorites').textContent = favorites.length;
    document.getElementById('totalWatched').textContent = watched.length;
    
    // Calculate favorite genre and average rating
    if (favorites.length > 0) {
        const genreCount = {};
        let totalRating = 0;
        
        for (const movieId of favorites) {
            try {
                const response = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}`);
                const movie = await response.json();
                
                totalRating += movie.vote_average;
                
                movie.genres.forEach(genre => {
                    genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Find most common genre
        const favoriteGenre = Object.keys(genreCount).reduce((a, b) => 
            genreCount[a] > genreCount[b] ? a : b
        );
        
        document.getElementById('favoriteGenre').textContent = favoriteGenre;
        document.getElementById('avgRating').textContent = (totalRating / favorites.length).toFixed(1);
    } else {
        document.getElementById('favoriteGenre').textContent = 'N/A';
        document.getElementById('avgRating').textContent = '0.0';
    }
}

// Toggle edit mode
function toggleEditMode() {
    const editSection = document.getElementById('editSection');
    editSection.classList.toggle('hidden');
    
    if (!editSection.classList.contains('hidden')) {
        // Populate form with current data
        document.getElementById('editUsername').value = userData.username;
        document.getElementById('editEmail').value = userData.email;
        document.getElementById('editPassword').value = '';
        document.getElementById('editConfirmPassword').value = '';
        clearErrors();
    }
}

// Clear errors
function clearErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
}

// Show error
function showError(fieldId, message) {
    document.getElementById(fieldId).textContent = message;
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle profile edit form submission
document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    let hasError = false;
    
    // Validate email
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        hasError = true;
    }
    
    // Check if email is taken by another user
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    const emailTaken = allUsers.some(key => {
        const user = JSON.parse(localStorage.getItem(key));
        return user.email === email && user.username !== currentUser;
    });
    
    if (emailTaken) {
        showError('emailError', 'Email is already registered by another user');
        hasError = true;
    }
    
    // Validate password if provided
    if (password) {
        if (password.length < 8 || password.length > 20) {
            showError('passwordError', 'Password must be 8-20 characters');
            hasError = true;
        }
        
        if (password !== confirmPassword) {
            showError('confirmError', 'Passwords do not match');
            hasError = true;
        }
    }
    
    if (hasError) return;
    
    // Update user data
    userData.email = email;
    if (password) {
        userData.password = password;
    }
    
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
    
    // Show success message
    const form = document.getElementById('editProfileForm');
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Profile updated successfully!';
    form.insertBefore(successMsg, form.firstChild);
    
    setTimeout(() => {
        successMsg.remove();
        toggleEditMode();
        loadProfileData();
    }, 2000);
});

// Initialize
loadProfileData();
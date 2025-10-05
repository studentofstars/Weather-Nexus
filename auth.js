// Authentication Module
// Handles user authentication with Supabase

const SUPABASE_URL = 'https://hkziikdwbmrnjzeregac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhremlpa2R3Ym1ybmp6ZXJlZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDM5OTQsImV4cCI6MjA3NTIxOTk5NH0.uWH_6nBxXTacx4dDci8JxDEbO0a2_s5tOz8W4ZN4cw4';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI Elements
const signInBtn = document.getElementById('sign-in-btn');
const authModalOverlay = document.getElementById('auth-modal-overlay');
const authModalClose = document.getElementById('auth-modal-close');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authTabs = document.querySelectorAll('.auth-tab');
const userMenu = document.getElementById('user-menu');
const userAvatarBtn = document.getElementById('user-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');
const signOutBtn = document.getElementById('sign-out-btn');
const notificationBtn = document.getElementById('notification-btn');

// Current user
let currentUser = null;

// Initialize
async function initAuth() {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        updateUIForLoggedInUser();
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateUIForLoggedInUser();
            closeAuthModal();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    // Hide sign in button
    signInBtn.classList.add('hidden');
    
    // Show user menu and notification button
    userMenu.classList.remove('hidden');
    notificationBtn.classList.remove('hidden');
    
    // Set user name and initials
    const userName = currentUser.user_metadata?.name || currentUser.email.split('@')[0];
    const initials = userName.charAt(0).toUpperCase();
    
    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-initials').textContent = initials;
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    // Show sign in button
    signInBtn.classList.remove('hidden');
    
    // Hide user menu and notification button
    userMenu.classList.add('hidden');
    notificationBtn.classList.add('hidden');
}

// Open auth modal
function openAuthModal() {
    authModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close auth modal
function closeAuthModal() {
    authModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    clearAuthForms();
}

// Clear auth forms
function clearAuthForms() {
    loginForm.reset();
    signupForm.reset();
    document.querySelectorAll('.auth-message').forEach(msg => {
        msg.classList.add('hidden');
        msg.textContent = '';
    });
}

// Switch auth tabs
function switchAuthTab(tab) {
    authTabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
    
    clearAuthForms();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');
    const submitBtn = loginForm.querySelector('.auth-submit-btn');
    const loader = submitBtn.querySelector('.button-loader');
    
    // Show loading
    submitBtn.disabled = true;
    loader.classList.remove('hidden');
    messageEl.classList.add('hidden');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Success - auth state change will handle UI update
        showMessage(messageEl, 'Welcome back!', 'success');
        
    } catch (error) {
        showMessage(messageEl, error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        loader.classList.add('hidden');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const messageEl = document.getElementById('signup-message');
    const submitBtn = signupForm.querySelector('.auth-submit-btn');
    const loader = submitBtn.querySelector('.button-loader');
    
    // Show loading
    submitBtn.disabled = true;
    loader.classList.remove('hidden');
    messageEl.classList.add('hidden');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        
        if (error) throw error;
        
        // Success
        showMessage(messageEl, 'Account created! Check your email to verify.', 'success');
        
        // Switch to login tab after 2 seconds
        setTimeout(() => {
            authTabs[0].click();
        }, 2000);
        
    } catch (error) {
        showMessage(messageEl, error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        loader.classList.add('hidden');
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        await supabase.auth.signOut();
        userDropdown.classList.add('hidden');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `auth-message ${type}`;
    element.classList.remove('hidden');
}

// Toggle user dropdown
function toggleUserDropdown() {
    userDropdown.classList.toggle('hidden');
}

// Event listeners
signInBtn.addEventListener('click', openAuthModal);
authModalClose.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) {
        closeAuthModal();
    }
});

authTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        switchAuthTab(tab.dataset.tab);
    });
});

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
signOutBtn.addEventListener('click', handleSignOut);
userAvatarBtn.addEventListener('click', toggleUserDropdown);

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

// Initialize on page load
initAuth();

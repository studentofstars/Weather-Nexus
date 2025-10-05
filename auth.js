// Authentication Module
// Handles user authentication with Supabase

const SUPABASE_URL = 'https://hkziikdwbmrnjzeregac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhremlpa2R3Ym1ybmp6ZXJlZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDM5OTQsImV4cCI6MjA3NTIxOTk5NH0.uWH_6nBxXTacx4dDci8JxDEbO0a2_s5tOz8W4ZN4cw4';

// Initialize Supabase client (make it globally accessible)
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = window.supabaseClient; // Local reference for this file

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
async function updateUIForLoggedInUser() {
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
    
    // Initialize notifications module
    if (window.notificationsModule) {
        window.notificationsModule.init();
    }
    
    // Check if user preferences exist, create if not
    try {
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // No preferences found, create them
            const { error: insertError } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: currentUser.id,
                    saved_cities: [],
                    notifications_enabled: true,
                    email_notifications: true
                });
            
            if (insertError) {
                console.error('Could not create preferences:', insertError);
            } else {
                console.log('User preferences created successfully');
            }
        }
    } catch (err) {
        console.log('Preferences check:', err.message);
    }
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
        // Sign up the user
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
        
        // Success - preferences will be created on first login
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

// Handle profile click
function handleProfileClick() {
    userDropdown.classList.add('hidden');
    // Show profile modal
    showProfileModal();
}

// Handle settings click
function handleSettingsClick() {
    userDropdown.classList.add('hidden');
    // Show settings modal
    showSettingsModal();
}

// Show profile modal
function showProfileModal() {
    const user = supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        
        const profileHTML = `
            <div class="modal-overlay" id="profile-modal">
                <div class="auth-modal" style="max-width: 500px;">
                    <div class="auth-modal-header">
                        <h2>User Profile</h2>
                        <button class="close-btn" onclick="closeProfileModal()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="profile-content" style="padding: 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: inline-flex; align-items: center; justify-content: center; font-size: 32px; color: white; font-weight: bold; margin-bottom: 15px;">
                                ${(user.user_metadata?.name || user.email).charAt(0).toUpperCase()}
                            </div>
                            <h3 style="margin: 0; font-size: 24px;">${user.user_metadata?.name || 'User'}</h3>
                            <p style="color: #666; margin: 5px 0;">${user.email}</p>
                        </div>
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="color: #666;">Account Status:</span>
                                <span style="color: #10b981; font-weight: 600;">✓ Active</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="color: #666;">Email Verified:</span>
                                <span style="color: ${user.email_confirmed_at ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                                    ${user.email_confirmed_at ? '✓ Yes' : '⚠ Pending'}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #666;">Member Since:</span>
                                <span style="font-weight: 600;">${new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onclick="closeProfileModal()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', profileHTML);
        document.body.style.overflow = 'hidden';
    });
}

// Show settings modal
function showSettingsModal() {
    const settingsHTML = `
        <div class="modal-overlay" id="settings-modal">
            <div class="auth-modal" style="max-width: 600px;">
                <div class="auth-modal-header">
                    <h2>Settings</h2>
                    <button class="close-btn" onclick="closeSettingsModal()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="settings-content" style="padding: 30px;">
                    <h3 style="margin-top: 0; color: #667eea; font-size: 18px; margin-bottom: 20px;">🔔 Notification Settings</h3>
                    
                    <div style="background: rgba(102, 126, 234, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <strong>Email Notifications</strong>
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Receive weather alerts via email</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="email-notif-toggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <strong>Push Notifications</strong>
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Receive browser notifications</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="push-notif-toggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Space Weather Alerts</strong>
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Solar flares and CME notifications</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="space-notif-toggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <h3 style="color: #667eea; font-size: 18px; margin-bottom: 20px;">🌍 Preferences</h3>
                    
                    <div style="background: rgba(102, 126, 234, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <p style="color: #666; margin-bottom: 15px;">More preference options coming soon:</p>
                        <ul style="color: #666; margin: 0; padding-left: 20px;">
                            <li>Temperature units (°C / °F)</li>
                            <li>Wind speed units (m/s / km/h / mph)</li>
                            <li>Custom weather alert thresholds</li>
                            <li>Favorite cities management</li>
                        </ul>
                    </div>
                    
                    <button onclick="saveSettings()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; margin-bottom: 10px;">
                        Save Settings
                    </button>
                    <button onclick="closeSettingsModal()" style="width: 100%; padding: 12px; background: transparent; color: #667eea; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', settingsHTML);
    document.body.style.overflow = 'hidden';
}

// Close modals
window.closeProfileModal = function() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Save settings
window.saveSettings = async function() {
    const emailNotif = document.getElementById('email-notif-toggle').checked;
    const pushNotif = document.getElementById('push-notif-toggle').checked;
    const spaceNotif = document.getElementById('space-notif-toggle').checked;
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { error } = await supabase
            .from('user_preferences')
            .update({
                notifications_enabled: pushNotif,
                email_notifications: emailNotif,
                space_weather_alerts: spaceNotif
            })
            .eq('user_id', user.id);
        
        if (error) throw error;
        
        alert('✅ Settings saved successfully!');
        closeSettingsModal();
    } catch (error) {
        alert('❌ Error saving settings: ' + error.message);
    }
};

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

// Add Profile and Settings button listeners
document.getElementById('profile-btn').addEventListener('click', handleProfileClick);
document.getElementById('settings-btn').addEventListener('click', handleSettingsClick);

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

// Initialize on page load
initAuth();

// Notifications Module
// Handles notification history, badges, and testing

// Get Supabase client (set by auth.js)
const getSupabase = () => window.supabaseClient;

// Initialize notification system
let unreadCount = 0;
let notificationHistory = [];

async function initNotifications() {
    const supabase = getSupabase();
    if (!supabase) {
        console.error('Supabase client not available');
        return;
    }
    
    console.log('🔔 Initializing notifications module...');

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.log('No active session for notifications');
        return;
    }
    
    console.log('✅ Notifications module initialized for user:', session.user.email);

    // Load notification history
    await loadNotificationHistory();
    
    // Set up real-time subscription for new notifications
    subscribeToNotifications();
    
    // Set up UI event listeners
    setupNotificationUI();
}

// Load notification history from API
async function loadNotificationHistory() {
    try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
            'https://weather-monitor-rho.vercel.app/api/notifications?action=getNotificationHistory',
            {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.error('Failed to load notifications');
            return;
        }

        const data = await response.json();
        notificationHistory = data.notifications || [];
        
        // Count unread notifications
        unreadCount = notificationHistory.filter(n => !n.read_at).length;
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Subscribe to real-time notification updates
function subscribeToNotifications() {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;

        // Subscribe to notification_history table changes for current user
        const subscription = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_history',
                    filter: `user_id=eq.${session.user.id}`
                },
                (payload) => {
                    console.log('New notification received:', payload);
                    handleNewNotification(payload.new);
                }
            )
            .subscribe();

        console.log('✅ Subscribed to real-time notifications');
    });
}

// Handle new notification
function handleNewNotification(notification) {
    notificationHistory.unshift(notification);
    unreadCount++;
    updateNotificationBadge();
    
    // Show browser notification if permitted
    showBrowserNotification(notification);
    
    // Update UI if notification panel is open
    if (document.getElementById('notification-panel')?.classList.contains('active')) {
        renderNotificationList();
    }
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Show browser notification
function showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/badge-icon.png'
        });
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return Notification.permission === 'granted';
}

// Set up UI event listeners
function setupNotificationUI() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = createNotificationPanel();
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationPanel);
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notification-panel');
        const btn = document.getElementById('notification-btn');
        
        if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
}

// Create notification panel UI
function createNotificationPanel() {
    // Check if panel already exists
    let panel = document.getElementById('notification-panel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel glass-panel';
    panel.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
        </div>
        <div id="notification-list" class="notification-list">
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    return panel;
}

// Toggle notification panel
function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    const isActive = panel.classList.toggle('active');
    
    if (isActive) {
        renderNotificationList();
        // Mark all as read after a delay
        setTimeout(markAllAsRead, 2000);
    }
}

// Render notification list
function renderNotificationList() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (notificationHistory.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }

    list.innerHTML = notificationHistory.map(notification => {
        const isUnread = !notification.read_at;
        const icon = notification.notification_type === 'weather' ? '🌍' : '🌌';
        const date = new Date(notification.sent_at).toLocaleString();

        return `
            <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">${icon}</div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${date}</span>
                </div>
                ${notification.email_sent ? '<i class="fas fa-envelope notification-email-badge" title="Email sent"></i>' : ''}
            </div>
        `;
    }).join('');
}

// Mark all notifications as read
async function markAllAsRead() {
    const unreadNotifications = notificationHistory.filter(n => !n.read_at);
    if (unreadNotifications.length === 0) return;

    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    for (const notification of unreadNotifications) {
        try {
            await fetch(
                'https://weather-monitor-rho.vercel.app/api/notifications?action=markAsRead',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        notificationId: notification.id
                    })
                }
            );

            notification.read_at = new Date().toISOString();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    unreadCount = 0;
    updateNotificationBadge();
    renderNotificationList();
}

// Send test notification
async function sendTestNotification() {
    try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Please sign in to test notifications');
            return;
        }

        const btn = document.getElementById('test-notification-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const response = await fetch(
            'https://weather-monitor-rho.vercel.app/api/notifications?action=sendTestNotification',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert('Test notification sent! Check your email.');
        } else {
            alert(`Error: ${data.error || 'Failed to send test notification'}`);
        }

        btn.innerHTML = originalHTML;
        btn.disabled = false;

    } catch (error) {
        console.error('Error sending test notification:', error);
        alert('Failed to send test notification');
        
        const btn = document.getElementById('test-notification-btn');
        btn.innerHTML = '<i class="fas fa-vial"></i>';
        btn.disabled = false;
    }
}

// Export functions for use in auth.js
window.notificationsModule = {
    init: initNotifications,
    requestPermission: requestNotificationPermission,
    loadHistory: loadNotificationHistory
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, notifications module ready');
    });
} else {
    // DOM already loaded
    console.log('📄 DOM already loaded, notifications module ready');
}

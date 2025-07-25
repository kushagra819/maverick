document.addEventListener('DOMContentLoaded', () => {
    // --- DATA SAVING FUNCTION ---
    const saveData = () => {
        localStorage.setItem('maverick_users', JSON.stringify(users));
        localStorage.setItem('maverick_turfs', JSON.stringify(turfs));
        localStorage.setItem('maverick_bookings', JSON.stringify(bookings));
        localStorage.setItem('maverick_blockedSlots', JSON.stringify(blockedSlots));
        localStorage.setItem('maverick_admins', JSON.stringify(admins));
    };

    // --- DATA STORE (Load from localStorage or use defaults) ---
    let users = JSON.parse(localStorage.getItem('maverick_users')) || [
        { id: 1, username: 'player', password: 'password' },
    ];
    let turfs = JSON.parse(localStorage.getItem('maverick_turfs')) || [
        { id: 1, name: 'Power Play Arena', location: 'Andheri', price: 1500, adminUser: 'admin1', imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noYi6KTd-fvK9L04dtAVBF21FYv1V_VwGIovHJI6ZINDFLdHsceIUVqTxHAKHAjHLIlhsz4WEtZ7KC5cVp8tSwGR9hFOC7qIVKb75O5Sf1dQTvUMZeyZSIpFG1wWViopBYdQ650=s1360-w1360-h1020-rw' },
        { id: 2, name: 'Kick Off Turf', location: 'Bandra', price: 1800, adminUser: 'admin1', imageUrl: 'https://playo.gumlet.io/TIGERPLAY/Tigerplay4.jpg' },
        { id: 3, name: 'Goal Zone', location: 'Juhu', price: 1600, adminUser: 'admin2', imageUrl: 'https://media.hudle.in/venues/69f0b367-377b-4044-b2c3-30f34fe5b7be/photo/8062f353b53f5a32bb235e13842e7eeffe06da73' }
    ];
    let bookings = JSON.parse(localStorage.getItem('maverick_bookings')) || [];
    let blockedSlots = JSON.parse(localStorage.getItem('maverick_blockedSlots')) || [];
    let admins = JSON.parse(localStorage.getItem('maverick_admins')) || [
        { username: 'admin1', password: 'password' },
        { username: 'admin2', password: 'password' },
    ];
    
    // Initial save if localStorage is empty
    if (!localStorage.getItem('maverick_users')) {
        saveData();
    }

    // --- STATE & CONFIG ---
    let loggedInUserId = null;
    let loggedInAdminUser = null;
    let activeAuthTab = 'player';
    let bookingSelection = {
        turfId: null,
        date: null,
        slots: []
    };
    let blockSlotPayload = {};
    let bookingToCancelId = null;
    const CANCELLATION_WINDOW_HOURS = 2;

    // --- DOM ELEMENTS ---
    const landingPage = document.getElementById('landing-page');
    const enterAppBtn = document.getElementById('enter-app-btn');
    const authPage = document.getElementById('auth-page');
    const mainApp = document.getElementById('main-app');
    const playerTab = document.getElementById('player-tab');
    const adminTab = document.getElementById('admin-tab');
    const playerAuthForms = document.getElementById('player-auth-forms');
    const adminAuthForm = document.getElementById('admin-auth-form');
    const playerLoginForm = document.getElementById('player-login-form');
    const playerRegisterForm = document.getElementById('player-register-form');
    const adminLoginForm = document.getElementById('admin-login-form');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const landingThemeToggle = document.getElementById('landing-theme-toggle');
    const landingThemeIconLight = document.getElementById('landing-theme-icon-light');
    const landingThemeIconDark = document.getElementById('landing-theme-icon-dark');
    const themeToggle = document.getElementById('theme-toggle');
    const mainAppThemeIconLight = document.getElementById('theme-icon-light');
    const mainAppThemeIconDark = document.getElementById('theme-icon-dark');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const playerView = document.getElementById('player-view');
    const adminView = document.getElementById('admin-view');
    const filterForm = document.getElementById('filter-form');
    const filterLocation = document.getElementById('filter-location');
    const filterDate = document.getElementById('filter-date');
    const filterTime = document.getElementById('filter-time');
    const filterResetBtn = document.getElementById('filter-reset-btn');
    const turfList = document.getElementById('turf-list');
    const myBookingsContainer = document.getElementById('my-bookings');
    const pendingApprovalsContainer = document.getElementById('pending-approvals');
    const adminTurfsList = document.getElementById('admin-turfs-list');
    const addTurfForm = document.getElementById('add-turf-form');
    const bookingModal = document.getElementById('booking-modal');
    const bookingSummary = document.getElementById('booking-summary');
    const paymentModal = document.getElementById('payment-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const blockSlotModal = document.getElementById('block-slot-modal');
    const cancelConfirmModal = document.getElementById('cancel-confirm-modal');
    const cancelModalNoBtn = document.getElementById('cancel-modal-no-btn');
    const cancelModalYesBtn = document.getElementById('cancel-modal-yes-btn');

    // --- FUNCTIONS ---

    let renderApp;

    // Landing Page & Carousel
    const initCarousel = () => {
        const carouselItems = document.querySelectorAll('.carousel-item');
        if (carouselItems.length === 0) return;
        let currentItem = 0;
        setInterval(() => {
            carouselItems[currentItem].classList.remove('active');
            currentItem = (currentItem + 1) % carouselItems.length;
            carouselItems[currentItem].classList.add('active');
        }, 5000);
    };
    
    const showAuthPage = () => {
        landingPage.style.display = 'none';
        authPage.style.display = 'flex';
    }

    // Auth & Page Routing
    const switchAuthTab = (tab) => {
        activeAuthTab = tab;
        playerTab.classList.toggle('active', tab === 'player');
        adminTab.classList.toggle('active', tab === 'admin');
        playerAuthForms.style.display = tab === 'player' ? 'block' : 'none';
        adminAuthForm.style.display = tab === 'admin' ? 'block' : 'none';
    };
    
    const showMainApp = () => {
        authPage.style.display = 'none';
        mainApp.style.display = 'block';
        renderApp();
    };

    // Theme
    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        mainAppThemeIconLight.classList.toggle('hidden', isDark);
        mainAppThemeIconDark.classList.toggle('hidden', !isDark);
        landingThemeIconLight.classList.toggle('hidden', isDark);
        landingThemeIconDark.classList.toggle('hidden', !isDark);
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        applyTheme(isDark);
        localStorage.setItem('maverick_theme', isDark ? 'dark' : 'light');
    };

    // Rendering and Filtering
    const populateTimeFilter = () => {
        filterTime.innerHTML = '<option value="">Any Time</option>';
        for (let i = 6; i < 23; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            filterTime.innerHTML += `<option value="${time}">${time}</option>`;
        }
    };
    
    const renderTimeSlots = () => {
        const container = document.getElementById('time-slots-container');
        container.innerHTML = '';
        const selectedDate = document.getElementById('booking-date').value;
        bookingSelection.date = selectedDate;
        const turfBookings = bookings.filter(b => b.turfId === bookingSelection.turfId && b.date === selectedDate && b.status !== 'rejected' && b.status !== 'cancelled').map(b => b.time);
        const turfBlocked = blockedSlots.filter(bs => bs.turfId === bookingSelection.turfId && bs.date === selectedDate).map(bs => bs.time);
        
        for (let i = 6; i < 23; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            const slot = document.createElement('div');
            slot.className = 'time-slot p-2 border dark:border-gray-600 rounded text-center cursor-pointer';
            slot.dataset.time = time;
            slot.textContent = time;
            if (turfBookings.includes(time)) {
                slot.classList.add('booked');
            } else if (turfBlocked.includes(time)) {
                slot.classList.add('blocked');
            } else {
                slot.classList.add('available');
            }
            container.appendChild(slot);
        }
    };

    const renderTurfList = (filteredTurfs = turfs) => {
        turfList.innerHTML = '';
        if (filteredTurfs.length === 0) {
            turfList.innerHTML = `<p class="text-gray-500 dark:text-gray-400 md:col-span-3 text-center">No turfs match the current filters.</p>`;
            return;
        }
        filteredTurfs.forEach(turf => {
            const turfCard = document.createElement('div');
            turfCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow';
            turfCard.innerHTML = `
                <img src="${turf.imageUrl}" alt="${turf.name}" class="w-full h-48 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';">
                <div class="p-4">
                    <h3 class="text-xl font-bold">${turf.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">${turf.location}</p>
                    <p class="text-lg font-semibold mb-4">₹${turf.price}/hour</p>
                    <button data-turf-id="${turf.id}" class="book-now-btn w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">View Slots</button>
                </div>
            `;
            turfList.appendChild(turfCard);
        });
    };

    const handleFilter = (e) => {
        if(e) e.preventDefault();
        const location = filterLocation.value.trim().toLowerCase();
        const date = filterDate.value;
        const time = filterTime.value;

        let filtered = [...turfs];

        if (location) {
            filtered = filtered.filter(turf => turf.location.toLowerCase().includes(location));
        }

        if (date && time) {
            filtered = filtered.filter(turf => {
                const isBooked = bookings.some(b => b.turfId === turf.id && b.date === date && b.time === time && (b.status === 'confirmed' || b.status === 'pending'));
                const isBlocked = blockedSlots.some(s => s.turfId === turf.id && s.date === date && s.time === time);
                return !isBooked && !isBlocked;
            });
        } else if (date) {
            filtered = filtered.filter(turf => {
                const totalSlots = 17; // 6 AM to 10 PM
                const bookedCount = bookings.filter(b => b.turfId === turf.id && b.date === date && (b.status === 'confirmed' || b.status === 'pending')).length;
                const blockedCount = blockedSlots.filter(s => s.turfId === turf.id && s.date === date).length;
                return (bookedCount + blockedCount) < totalSlots;
            });
        }
        
        renderTurfList(filtered);
    };

    const renderMyBookings = () => {
        myBookingsContainer.innerHTML = '';
        const userBookings = bookings.filter(b => b.userId === loggedInUserId).sort((a,b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
        if (userBookings.length === 0) {
            myBookingsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400">You have no bookings.</p>`;
            return;
        }
        userBookings.forEach(booking => {
            const turf = turfs.find(t => t.id === booking.turfId);
            const statusClasses = {
                pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                cancelled: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            };

            const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
            const now = new Date();
            const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
            
            let actionButton = '';
            const canCancel = (booking.status === 'pending' || booking.status === 'confirmed');

            if (canCancel) {
                if (hoursUntilBooking > CANCELLATION_WINDOW_HOURS) {
                    actionButton = `<button data-booking-id="${booking.id}" class="cancel-booking-btn bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm">Cancel</button>`;
                } else if (hoursUntilBooking > 0) {
                    actionButton = `<button class="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm opacity-50 cursor-not-allowed" title="Cannot cancel within ${CANCELLATION_WINDOW_HOURS} hours of slot time." disabled>Cancel</button>`;
                }
            }

            const bookingCard = document.createElement('div');
            bookingCard.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center';
            bookingCard.innerHTML = `
                <div>
                    <p class="font-bold">${turf.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${new Date(booking.date).toDateString()}, ${booking.time}</p>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-sm font-medium capitalize px-2 py-1 rounded-full ${statusClasses[booking.status]}">${booking.status}</span>
                    ${actionButton}
                </div>
            `;
            myBookingsContainer.appendChild(bookingCard);
        });
    };
    
    const renderPendingApprovals = () => {
        pendingApprovalsContainer.innerHTML = '';
        const adminTurfIds = turfs.filter(t => t.adminUser === loggedInAdminUser).map(t => t.id);
        const pending = bookings.filter(b => adminTurfIds.includes(b.turfId) && b.status === 'pending');
        if (pending.length === 0) {
            pendingApprovalsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400">No pending approvals.</p>`;
            return;
        }
        pending.forEach(booking => {
            const turf = turfs.find(t => t.id === booking.turfId);
            const user = users.find(u => u.id === booking.userId);
            const approvalCard = document.createElement('div');
            approvalCard.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center';
            approvalCard.innerHTML = `
                <div>
                    <p><span class="font-bold">${turf.name}</span> - ${new Date(booking.date).toDateString()}, ${booking.time}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Requested by: ${user.username}</p>
                </div>
                <div class="space-x-2">
                    <button data-booking-id="${booking.id}" data-action="rejected" class="approve-reject-btn bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm">Reject</button>
                    <button data-booking-id="${booking.id}" data-action="confirmed" class="approve-reject-btn bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm">Approve</button>
                </div>
            `;
            pendingApprovalsContainer.appendChild(approvalCard);
        });
    };

    const renderAdminCalendarForTurf = (turfId) => {
        const calendarEl = document.getElementById(`calendar-for-turf-${turfId}`);
        calendarEl.innerHTML = '';
        const confirmedBookings = bookings.filter(b => b.turfId === turfId && b.status === 'confirmed');
        const turfBlockedSlots = blockedSlots.filter(bs => bs.turfId === turfId);
        
        const allEvents = [...confirmedBookings, ...turfBlockedSlots];
        if (allEvents.length === 0) {
            calendarEl.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No confirmed bookings or blocked slots for this turf.</p>';
            return;
        }

        const eventsByDate = allEvents.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {});

        Object.keys(eventsByDate).sort().forEach(date => {
            const dateHeader = document.createElement('h4');
            dateHeader.className = 'font-semibold mt-4 mb-2 text-md';
            dateHeader.textContent = new Date(date).toDateString();
            calendarEl.appendChild(dateHeader);

            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'grid grid-cols-3 md:grid-cols-6 gap-2';
            eventsByDate[date].sort((a, b) => a.time.localeCompare(b.time)).forEach(event => {
                const isBlocked = !!event.reason;
                const slot = document.createElement('div');
                slot.className = `p-2 rounded text-center text-white text-sm ${isBlocked ? 'bg-zinc-500' : 'bg-red-500'}`;
                slot.innerHTML = `
                    <p class="font-semibold">${event.time}</p>
                    <p class="text-xs">${isBlocked ? event.reason : `Booked`}</p>
                    ${isBlocked ? `<button data-slot-id="${event.id}" class="unblock-btn text-xs hover:underline">Unblock</button>` : ''}
                `;
                slotsContainer.appendChild(slot);
            });
            calendarEl.appendChild(slotsContainer);
        });
    };

    const renderAdminTurfsList = () => {
        adminTurfsList.innerHTML = '';
        const adminTurfs = turfs.filter(t => t.adminUser === loggedInAdminUser);
        if(adminTurfs.length === 0) {
             adminTurfsList.innerHTML = `<p class="text-gray-500 dark:text-gray-400">You have not added any turfs yet.</p>`;
             return;
        }
        adminTurfs.forEach(turf => {
            const turfContainer = document.createElement('div');
            turfContainer.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md';
            turfContainer.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold">${turf.name}</h3>
                        <p class="text-gray-600 dark:text-gray-400">${turf.location}</p>
                    </div>
                    <button data-turf-id="${turf.id}" class="block-slot-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Block a Slot</button>
                </div>
                <div class="mt-4" id="calendar-for-turf-${turf.id}"></div>
            `;
            adminTurfsList.appendChild(turfContainer);
            renderAdminCalendarForTurf(turf.id);
        });
    };
    
    const renderAdminView = () => {
        renderPendingApprovals();
        renderAdminTurfsList();
    };

    renderApp = () => {
        if (loggedInUserId) {
            const user = users.find(u => u.id === loggedInUserId);
            welcomeMessage.textContent = `Welcome, ${user.username}!`;
            playerView.style.display = 'block';
            adminView.style.display = 'none';
            renderTurfList();
            renderMyBookings();
        } else if (loggedInAdminUser) {
            welcomeMessage.textContent = `Admin: ${loggedInAdminUser}`;
            playerView.style.display = 'none';
            adminView.style.display = 'block';
            renderAdminView();
        }
    };
    
    // Modals
    const openBookingModal = () => {
        bookingSelection.slots = []; // Reset previous selections
        const turf = turfs.find(t => t.id === bookingSelection.turfId);
        document.getElementById('modal-turf-name').textContent = `Book Slots at ${turf.name}`;
        const dateInput = document.getElementById('booking-date');
        dateInput.value = new Date().toISOString().split('T')[0];
        renderTimeSlots();
        updateBookingSummary();
        bookingModal.classList.add('active');
    };

    const updateBookingSummary = () => {
        const turf = turfs.find(t => t.id === bookingSelection.turfId);
        const slotCount = bookingSelection.slots.length;
        if (slotCount === 0) {
            bookingSummary.textContent = 'Select one or more slots.';
            return;
        }
        const totalPrice = slotCount * turf.price;
        bookingSummary.textContent = `${slotCount} slot(s) selected | Total: ₹${totalPrice}`;
    };

    const openPaymentModal = () => {
        const turf = turfs.find(t => t.id === bookingSelection.turfId);
        const paymentDetailsEl = document.getElementById('payment-details');
        const paymentTotalEl = document.getElementById('payment-total');
        paymentDetailsEl.innerHTML = '';
        bookingSelection.slots.sort().forEach(slot => {
            paymentDetailsEl.innerHTML += `<p>${turf.name} on ${new Date(bookingSelection.date).toDateString()} at ${slot}</p>`;
        });
        const totalPrice = bookingSelection.slots.length * turf.price;
        paymentTotalEl.textContent = `Total Amount: ₹${totalPrice}`;
        paymentModal.classList.add('active');
    };
    
    const showConfirmationModal = () => {
        const turf = turfs.find(t => t.id === bookingSelection.turfId);
        document.getElementById('confirmation-details').textContent = `${bookingSelection.slots.length} slot(s) for ${turf.name} on ${new Date(bookingSelection.date).toDateString()}.`;
        confirmationModal.classList.add('active');
    };
    
    const openBlockSlotModal = () => {
        const dateInput = document.getElementById('block-date');
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.min = new Date().toISOString().split('T')[0];
        const timeSelect = document.getElementById('block-time');
        timeSelect.innerHTML = '';
        for (let i = 6; i < 23; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
        }
        blockSlotModal.classList.add('active');
    };

    // --- EVENT LISTENERS ---
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', showAuthPage));
    enterAppBtn.addEventListener('click', showAuthPage);
    
    playerTab.addEventListener('click', () => switchAuthTab('player'));
    adminTab.addEventListener('click', () => switchAuthTab('admin'));
    showRegisterBtn.addEventListener('click', () => {
        playerLoginForm.style.display = 'none';
        playerRegisterForm.style.display = 'block';
    });
    showLoginBtn.addEventListener('click', () => {
        playerLoginForm.style.display = 'block';
        playerRegisterForm.style.display = 'none';
    });

    playerLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('player-username').value;
        const password = document.getElementById('player-password').value;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            loggedInUserId = user.id;
            loggedInAdminUser = null;
            showMainApp();
        } else {
            document.getElementById('player-login-error').textContent = 'Invalid credentials.';
        }
    });

    playerRegisterForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        if (users.some(u => u.username === username)) {
            document.getElementById('player-register-error').textContent = 'Username already exists.';
            return;
        }
        const newUser = { id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, username, password };
        users.push(newUser);
        saveData();
        loggedInUserId = newUser.id;
        loggedInAdminUser = null;
        showMainApp();
    });

    adminLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const admin = admins.find(a => a.username === username && a.password === password);
        if (admin) {
            loggedInAdminUser = admin.username;
            loggedInUserId = null;
            showMainApp();
        } else {
            document.getElementById('admin-login-error').textContent = 'Invalid admin credentials.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        loggedInUserId = null;
        loggedInAdminUser = null;
        mainApp.style.display = 'none';
        authPage.style.display = 'none';
        landingPage.style.display = 'flex';
        playerLoginForm.reset();
        playerRegisterForm.reset();
        adminLoginForm.reset();
    });

    themeToggle.addEventListener('click', toggleTheme);
    landingThemeToggle.addEventListener('click', toggleTheme);
    
    filterForm.addEventListener('submit', handleFilter);
    filterResetBtn.addEventListener('click', () => {
        filterForm.reset();
        renderTurfList();
    });

    addTurfForm.addEventListener('submit', e => {
        e.preventDefault();
        const newTurf = {
            id: turfs.length > 0 ? Math.max(...turfs.map(t => t.id)) + 1 : 1,
            name: document.getElementById('turf-name').value,
            location: document.getElementById('turf-location').value,
            price: parseFloat(document.getElementById('turf-price').value),
            imageUrl: document.getElementById('turf-image').value,
            adminUser: loggedInAdminUser
        };
        turfs.push(newTurf);
        saveData();
        addTurfForm.reset();
        renderAdminTurfsList();
    });

    myBookingsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('cancel-booking-btn')) {
            bookingToCancelId = parseInt(e.target.dataset.bookingId);
            cancelConfirmModal.classList.add('active');
        }
    });

    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('book-now-btn')) {
            bookingSelection.turfId = parseInt(e.target.dataset.turfId);
            openBookingModal();
        }
        if (e.target.classList.contains('approve-reject-btn')) {
            const bookingId = parseInt(e.target.dataset.bookingId);
            const action = e.target.dataset.action;
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = action;
                saveData();
                renderAdminView();
            }
        }
        if (e.target.classList.contains('block-slot-btn')) {
            blockSlotPayload.turfId = parseInt(e.target.dataset.turfId);
            openBlockSlotModal();
        }
         if (e.target.classList.contains('unblock-btn')) {
            const slotId = parseInt(e.target.dataset.slotId);
            blockedSlots = blockedSlots.filter(bs => bs.id !== slotId);
            saveData();
            renderAdminTurfsList();
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => bookingModal.classList.remove('active'));
    document.getElementById('booking-date').addEventListener('change', () => {
        bookingSelection.slots = [];
        renderTimeSlots();
        updateBookingSummary();
    });

    document.getElementById('time-slots-container').addEventListener('click', e => {
        if (e.target.classList.contains('available')) {
            const time = e.target.dataset.time;
            e.target.classList.toggle('selected');
            if (bookingSelection.slots.includes(time)) {
                bookingSelection.slots = bookingSelection.slots.filter(s => s !== time);
            } else {
                bookingSelection.slots.push(time);
            }
            updateBookingSummary();
        }
    });
    document.getElementById('confirm-booking-btn').addEventListener('click', () => {
         if (bookingSelection.slots.length === 0) { return; }
         bookingModal.classList.remove('active');
         openPaymentModal();
    });
    
    document.getElementById('cancel-payment-btn').addEventListener('click', () => paymentModal.classList.remove('active'));
    document.getElementById('confirm-payment-btn').addEventListener('click', () => {
        const lastBookingId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) : 0;
        bookingSelection.slots.forEach((slot, index) => {
            const newBooking = {
                id: lastBookingId + index + 1,
                turfId: bookingSelection.turfId,
                userId: loggedInUserId,
                date: bookingSelection.date,
                time: slot,
                status: 'pending'
            };
            bookings.push(newBooking);
        });
        
        saveData();
        paymentModal.classList.remove('active');
        showConfirmationModal();
        renderMyBookings();
        bookingSelection = { turfId: null, date: null, slots: [] }; // Reset selection
    });

    document.getElementById('close-confirmation-modal-btn').addEventListener('click', () => confirmationModal.classList.remove('active'));
    
    cancelModalNoBtn.addEventListener('click', () => {
        cancelConfirmModal.classList.remove('active');
        bookingToCancelId = null;
    });

    cancelModalYesBtn.addEventListener('click', () => {
        const booking = bookings.find(b => b.id === bookingToCancelId);
        if (booking) {
            booking.status = 'cancelled';
            saveData();
            renderMyBookings();
        }
        cancelConfirmModal.classList.remove('active');
        bookingToCancelId = null;
    });

    document.getElementById('close-block-modal-btn').addEventListener('click', () => blockSlotModal.classList.remove('active'));
    document.getElementById('confirm-block-slot-btn').addEventListener('click', () => {
        const newBlockedSlot = {
            id: blockedSlots.length > 0 ? Math.max(...blockedSlots.map(bs => bs.id)) + 1 : 1,
            turfId: blockSlotPayload.turfId,
            date: document.getElementById('block-date').value,
            time: document.getElementById('block-time').value,
            reason: document.getElementById('block-reason').value || 'Blocked'
        };
        blockedSlots.push(newBlockedSlot);
        saveData();
        blockSlotModal.classList.remove('active');
        renderAdminTurfsList();
        blockSlotPayload = {};
    });

    // --- INITIALIZATION ---
    initCarousel();
    switchAuthTab('player');
    populateTimeFilter();
    const savedTheme = localStorage.getItem('maverick_theme');
    applyTheme(savedTheme === 'dark');
});

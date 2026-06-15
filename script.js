const glowBoxes = document.querySelectorAll('.info');
const headerRows = document.querySelectorAll('.header-row');

const routeData = {
    'london-dubai': {
        label: 'Sydney to Dubai',
        from: 'Sydney Airport',
        to: 'Dubai',
        duration: '14h 10m',
        frequency: 'Daily',
    },
    'paris-rome': {
        label: 'Sydney to Paris',
        from: 'Sydney Airport',
        to: 'Paris',
        duration: '17h 20m',
        frequency: '4x weekly',
    },
    'newyork-toronto': {
        label: 'Sydney to New York',
        from: 'Sydney Airport',
        to: 'New York',
        duration: '10h 05m',
        frequency: 'Daily',
    },
    'dubai-london': {
        label: 'Sydney to London',
        from: 'Sydney Airport',
        to: 'London',
        duration: '16h 40m',
        frequency: 'Daily',
    },
    'rome-paris': {
        label: 'Sydney to Rome',
        from: 'Sydney Airport',
        to: 'Rome',
        duration: '14h 55m',
        frequency: '4x weekly',
    },
    'toronto-newyork': {
        label: 'Sydney to Toronto',
        from: 'Sydney Airport',
        to: 'Toronto',
        duration: '10h 40m',
        frequency: 'Daily',
    },
};

const bookingStorageKey = 'hairlineAirlineBookings';
const latestBookingKey = 'hairlineAirlineLatestBooking';
const isHomePage = document.body.dataset.page === 'home';

glowBoxes.forEach((box) => {
    const updateGlow = (event) => {
        const rect = box.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        box.style.setProperty('--glow-x', `${x}%`);
        box.style.setProperty('--glow-y', `${y}%`);
    };

    box.addEventListener('pointermove', updateGlow);
    box.addEventListener('pointerenter', updateGlow);
    box.addEventListener('pointerleave', () => {
        box.style.setProperty('--glow-x', '50%');
        box.style.setProperty('--glow-y', '50%');
    });
});

headerRows.forEach((headerRow) => {
    const nav = headerRow.querySelector('nav');

    if (!nav || headerRow.querySelector('.nav-toggle')) {
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'nav-toggle';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    toggleButton.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><span></span></span><span class="nav-toggle-text">Menu</span>';

    toggleButton.addEventListener('click', () => {
        const isOpen = headerRow.classList.toggle('nav-open');
        toggleButton.setAttribute('aria-expanded', String(isOpen));
    });

    nav.setAttribute('aria-label', 'Primary navigation');
    headerRow.insertBefore(toggleButton, nav);

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            headerRow.classList.remove('nav-open');
            toggleButton.setAttribute('aria-expanded', 'false');
        });
    });
});

window.requestAnimationFrame(() => {
    document.body.classList.add('page-ready');
});

if (isHomePage) {
    const homeSpaceLayer = document.createElement('div');
    homeSpaceLayer.className = 'home-space-layer';
    document.body.appendChild(homeSpaceLayer);

    const starCount = window.innerWidth < 768 ? 28 : 52;
    const starColors = ['', 'star-blue', 'star-gold'];

    for (let index = 0; index < starCount; index += 1) {
        const star = document.createElement('span');
        star.className = `home-star ${starColors[Math.floor(Math.random() * starColors.length)]}`;
        star.style.setProperty('--x', `${Math.random() * 100}%`);
        star.style.setProperty('--y', `${Math.random() * 100}%`);
        star.style.setProperty('--size', `${1 + Math.random() * 2.2}px`);
        star.style.setProperty('--duration', `${3 + Math.random() * 4.5}s`);
        star.style.setProperty('--delay', `${Math.random() * 4}s`);
        homeSpaceLayer.appendChild(star);
    }

    let shootingStarTimer = null;

    const spawnShootingStar = () => {
        const shootingStar = document.createElement('span');
        shootingStar.className = 'home-shooting-star';
        shootingStar.style.setProperty('--x', `${10 + Math.random() * 70}%`);
        shootingStar.style.setProperty('--y', `${5 + Math.random() * 40}%`);
        shootingStar.style.setProperty('--rot', `${-30 + Math.random() * 20}deg`);
        homeSpaceLayer.appendChild(shootingStar);
        window.setTimeout(() => shootingStar.remove(), 1100);
    };

    spawnShootingStar();
    shootingStarTimer = window.setInterval(spawnShootingStar, 5200);

    window.addEventListener('pagehide', () => {
        if (shootingStarTimer) {
            window.clearInterval(shootingStarTimer);
            shootingStarTimer = null;
        }
        homeSpaceLayer.remove();
    });
}

const bookingForm = document.getElementById('booking-form');
const routeSelect = document.getElementById('route');
const routeSummary = document.getElementById('route-summary');
const successPage = document.body.dataset.page === 'success';
const bookingsPage = document.body.dataset.page === 'bookings';

const getBookings = () => {
    try {
        return JSON.parse(localStorage.getItem(bookingStorageKey) || '[]');
    } catch {
        return [];
    }
};

const saveBookings = (bookings) => {
    localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
};

const updateBookingById = (bookingId, updates) => {
    const bookings = getBookings();
    const updatedBookings = bookings.map((booking) => booking.id === bookingId ? { ...booking, ...updates } : booking);
    saveBookings(updatedBookings);
    return updatedBookings.find((booking) => booking.id === bookingId) || null;
};

const getPaymentAmount = (passengers) => {
    const passengerCount = Math.max(1, Number(passengers) || 1);
    const minimum = Math.max(1000, 1000 + ((passengerCount - 1) * 1400));
    const maximum = Math.min(10000, minimum + 3200 + ((passengerCount - 1) * 250));
    const amount = minimum + Math.floor(Math.random() * Math.max(1, maximum - minimum + 1));

    return Math.min(10000, amount);
};

const renderRouteSummary = (routeId) => {
    if (!routeSummary) {
        return;
    }

    const route = routeData[routeId];

    if (!route) {
        routeSummary.innerHTML = '<h3>Route preview</h3><p>Select a route to see the flight details here.</p>';
        return;
    }

    routeSummary.innerHTML = `
        <h3>${route.label}</h3>
        <p><b>From:</b> ${route.from}</p>
        <p><b>To:</b> ${route.to}</p>
        <p><b>Duration:</b> ${route.duration}</p>
        <p><b>Frequency:</b> ${route.frequency}</p>
    `;
};

if (routeSelect && routeSummary) {
    routeSelect.addEventListener('change', () => renderRouteSummary(routeSelect.value));
    renderRouteSummary(routeSelect.value);
}

if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(bookingForm);
        const routeId = String(formData.get('route') || '');
        const route = routeData[routeId];
        const booking = {
            id: `HA-${Date.now()}`,
            routeId,
            routeLabel: route ? route.label : routeId,
            from: route ? route.from : '',
            to: route ? route.to : '',
            name: String(formData.get('name') || ''),
            email: String(formData.get('email') || ''),
            date: String(formData.get('date') || ''),
            passengers: String(formData.get('passengers') || ''),
            travelClass: String(formData.get('class') || ''),
            notes: String(formData.get('notes') || ''),
            timestamp: new Date().toISOString(),
        };

        const bookings = getBookings();
        bookings.unshift(booking);
        saveBookings(bookings);
        sessionStorage.setItem(latestBookingKey, JSON.stringify(booking));
        document.body.classList.add('page-leaving');
        window.setTimeout(() => {
            window.location.href = 'success.html';
        }, 250);
    });
}

if (successPage) {
    const latestBooking = (() => {
        try {
            return JSON.parse(sessionStorage.getItem(latestBookingKey) || 'null');
        } catch {
            return null;
        }
    })();

    const proceedPaymentButton = document.getElementById('proceed-payment');
    const paymentPanel = document.getElementById('payment-panel');
    const paymentAmount = document.getElementById('payment-amount');
    const paymentForm = document.getElementById('payment-form');
    const paymentResult = document.getElementById('payment-result');
    const paymentResultText = document.getElementById('payment-result-text');
    let currentPaymentAmount = 0;

    const setSummary = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 'Not available';
        }
    };

    const showPaymentPanel = () => {
        if (!latestBooking || !paymentPanel || !paymentAmount) {
            return;
        }

        currentPaymentAmount = getPaymentAmount(latestBooking.passengers);
        paymentAmount.textContent = `$${currentPaymentAmount.toLocaleString()}`;
        paymentPanel.hidden = false;
        if (proceedPaymentButton) {
            proceedPaymentButton.disabled = true;
            proceedPaymentButton.textContent = 'Proceeding...';
        }
    };

    setSummary('summary-route', latestBooking ? latestBooking.routeLabel : 'No booking found');
    setSummary('summary-name', latestBooking ? latestBooking.name : 'No booking found');
    setSummary('summary-date', latestBooking ? latestBooking.date : 'No booking found');
    setSummary('summary-passengers', latestBooking ? latestBooking.passengers : 'No booking found');
    setSummary('summary-class', latestBooking ? latestBooking.travelClass : 'No booking found');

    if (proceedPaymentButton) {
        proceedPaymentButton.addEventListener('click', showPaymentPanel);
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!latestBooking || !currentPaymentAmount) {
                return;
            }

            const paidBooking = {
                ...latestBooking,
                paymentStatus: 'confirmed',
                amountPaid: currentPaymentAmount,
            };

            sessionStorage.setItem(latestBookingKey, JSON.stringify(paidBooking));
            updateBookingById(latestBooking.id, {
                paymentStatus: 'confirmed',
                amountPaid: currentPaymentAmount,
            });

            if (paymentPanel) {
                paymentPanel.hidden = true;
            }

            if (paymentResult && paymentResultText) {
                paymentResultText.textContent = `Confirmed amount paid: $${currentPaymentAmount.toLocaleString()}. Your booking is now complete.`;
                paymentResult.hidden = false;
            }
        });
    }
}

if (bookingsPage) {
    const bookingList = document.getElementById('booking-list');
    const clearButton = document.getElementById('clear-bookings');

    const renderBookings = () => {
        if (!bookingList) {
            return;
        }

        const bookings = getBookings();

        if (!bookings.length) {
            bookingList.innerHTML = '<div class="booking-empty"><p>No saved bookings yet.</p></div>';
            return;
        }

        bookingList.innerHTML = bookings.map((booking) => `
            <article class="booking-entry">
                <h3>${booking.routeLabel}</h3>
                <div class="booking-entry-grid">
                    <p><b>ID:</b> ${booking.id}</p>
                    <p><b>Name:</b> ${booking.name}</p>
                    <p><b>Email:</b> ${booking.email}</p>
                    <p><b>Date:</b> ${booking.date}</p>
                    <p><b>Passengers:</b> ${booking.passengers}</p>
                    <p><b>Class:</b> ${booking.travelClass}</p>
                </div>
                <p><b>Payment status:</b> ${booking.paymentStatus || 'pending'}</p>
                ${booking.amountPaid ? `<p><b>Amount paid:</b> $${Number(booking.amountPaid).toLocaleString()}</p>` : ''}
                ${booking.notes ? `<p><b>Notes:</b> ${booking.notes}</p>` : ''}
                <p><b>Saved:</b> ${new Date(booking.timestamp).toLocaleString()}</p>
            </article>
        `).join('');
    };

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            saveBookings([]);
            renderBookings();
        });
    }

    renderBookings();
}

const isGiveawayPage = document.body.dataset.page === 'giveaway';

if (isGiveawayPage) {
    const backgroundMusic = document.createElement('audio');
    backgroundMusic.src = 'original_zeowGW1.mp3';
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.4;
    backgroundMusic.preload = 'auto';
    backgroundMusic.setAttribute('aria-hidden', 'true');
    backgroundMusic.style.display = 'none';

    document.body.appendChild(backgroundMusic);

    const partyLayer = document.createElement('div');
    partyLayer.className = 'party-layer';
    document.body.appendChild(partyLayer);

    const musicToggle = document.getElementById('music-toggle');
    const fadeDuration = 350;
    let fadeTimer = null;
    let flashTimer = null;
    let burstTimer = null;
    let cleanupTimer = null;

    const setButtonState = (isPlaying) => {
        if (!musicToggle) {
            return;
        }

        musicToggle.textContent = isPlaying ? 'Stop Music' : 'Play Music';
        musicToggle.classList.toggle('is-playing', isPlaying);
        musicToggle.setAttribute('aria-pressed', String(isPlaying));
    };

    const clearPartyNodes = () => {
        partyLayer.replaceChildren();
    };

    const spawnFlash = () => {
        const flash = document.createElement('div');
        flash.className = 'party-flash';
        flash.style.setProperty('--x', `${Math.random() * 100}%`);
        flash.style.setProperty('--y', `${Math.random() * 100}%`);
        partyLayer.appendChild(flash);
        window.setTimeout(() => flash.remove(), 1250);
    };

    const spawnBurst = () => {
        const burstCount = 4 + Math.floor(Math.random() * 4);

        for (let index = 0; index < burstCount; index += 1) {
            const streak = document.createElement('div');
            streak.className = 'party-streak';
            streak.style.setProperty('--x', `${10 + Math.random() * 80}%`);
            streak.style.setProperty('--y', `${10 + Math.random() * 70}%`);
            streak.style.setProperty('--rot', `${-60 + Math.random() * 120}deg`);
            partyLayer.appendChild(streak);
            window.setTimeout(() => streak.remove(), 950);
        }

        const popperCount = 8 + Math.floor(Math.random() * 8);
        const colors = ['#ffffff', '#63d6ff', '#9ce8ff', '#f6b14a'];

        for (let index = 0; index < popperCount; index += 1) {
            const popper = document.createElement('div');
            popper.className = 'party-popper';
            const baseX = 15 + Math.random() * 70;
            const baseY = 10 + Math.random() * 65;
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 160;

            popper.style.setProperty('--x', `${baseX}%`);
            popper.style.setProperty('--y', `${baseY}%`);
            popper.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            popper.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            popper.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
            partyLayer.appendChild(popper);
            window.setTimeout(() => popper.remove(), 950);
        }
    };

    const startPartyEffects = () => {
        if (flashTimer || burstTimer) {
            return;
        }

        document.body.classList.add('party-active');
        spawnBurst();
        spawnFlash();
        flashTimer = window.setInterval(spawnFlash, 220);
        burstTimer = window.setInterval(spawnBurst, 520);
    };

    const stopPartyEffects = () => {
        if (flashTimer) {
            window.clearInterval(flashTimer);
            flashTimer = null;
        }

        if (burstTimer) {
            window.clearInterval(burstTimer);
            burstTimer = null;
        }

        if (cleanupTimer) {
            window.clearTimeout(cleanupTimer);
            cleanupTimer = null;
        }

        document.body.classList.remove('party-active');
        clearPartyNodes();
    };

    const playMusic = () => {
        backgroundMusic.volume = 0.4;
        backgroundMusic.play().then(() => {
            setButtonState(true);
            startPartyEffects();
        }).catch(() => {
            setButtonState(false);
        });
    };

    const stopMusic = (immediate = false) => {
        stopPartyEffects();

        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }

        if (immediate) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            setButtonState(false);
            return;
        }

        const steps = 8;
        const stepVolume = backgroundMusic.volume / steps;
        let currentStep = 0;

        fadeTimer = window.setInterval(() => {
            currentStep += 1;
            backgroundMusic.volume = Math.max(0, backgroundMusic.volume - stepVolume);

            if (currentStep >= steps || backgroundMusic.volume <= 0.01) {
                window.clearInterval(fadeTimer);
                fadeTimer = null;
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
                backgroundMusic.volume = 0.4;
                setButtonState(false);
            }
        }, fadeDuration / steps);
    };

    const toggleMusic = () => {
        if (backgroundMusic.paused) {
            playMusic();
        } else {
            stopMusic();
        }
    };

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    playMusic();

    ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
        window.addEventListener(eventName, playMusic, { once: true, passive: true });
    });

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');

        if (!link) {
            return;
        }

        const href = link.getAttribute('href') || '';
        const isExternal = /^https?:\/\//i.test(href);
        const isMailOrTel = /^(mailto:|tel:)/i.test(href);
        const opensNewTab = link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;

        if (isExternal || isMailOrTel || opensNewTab || href.startsWith('#')) {
            return;
        }

        event.preventDefault();
        stopMusic();
        document.body.classList.add('page-leaving');
        window.setTimeout(() => {
            window.location.href = href;
        }, Math.max(fadeDuration, 250));
    });

    window.addEventListener('pagehide', () => {
        stopMusic(true);
    });
}

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');

    if (!link) {
        return;
    }

    const href = link.getAttribute('href') || '';
    const isExternal = /^https?:\/\//i.test(href);
    const isMailOrTel = /^(mailto:|tel:)/i.test(href);
    const opensNewTab = link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;

    if (isExternal || isMailOrTel || opensNewTab || href.startsWith('#')) {
        return;
    }

    if (document.body.dataset.page === 'giveaway') {
        return;
    }

    event.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(() => {
        window.location.href = href;
    }, 250);
});
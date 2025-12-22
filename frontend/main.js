document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation ---
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navList = document.querySelector('.main-nav ul');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navList.classList.remove('active');
                if (mobileBtn) {
                    const icon = mobileBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.service-card').forEach(el => observer.observe(el));

    // --- Booking Wizard Logic ---
    const wizardState = {
        name: '',
        phone: '',
        email: '',
        persons: 1,
        date: '',
        time: '',
        selections: [], // Array of objects { personId: 1, category: '', service: '', price: '' }
        note: ''
    };

    let currentStep = 1;
    const totalSteps = 3;

    const steps = document.querySelectorAll('.form-step');
    const indicators = document.querySelectorAll('.step-indicator');

    // Buttons
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const submitBtn = document.querySelector('.submit-btn');

    // Inputs
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    const noteInput = document.getElementById('note');
    const servicesDynamicContainer = document.getElementById('services-dynamic-container');

    // Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s]*$/;

    // Contact Input Formatters
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Allow only numbers, +, and spaces
            if (!phoneRegex.test(e.target.value)) {
                e.target.value = e.target.value.replace(/[^0-9+\s]/g, '');
            }
        });
    }

    // Data
    const servicesData = {
        'damske': [
            { name: 'Střih + Foukaná (Krátké)', price: '580 - 650 Kč' },
            { name: 'Střih + Foukaná (Polodlouhé)', price: '680 - 780 Kč' },
            { name: 'Střih + Foukaná (Dlouhé)', price: '780 - 880 Kč' },
            { name: 'Barva + Střih (Krátké)', price: '880 - 980 Kč' },
            { name: 'Barva + Střih (Polodlouhé)', price: '980 - 1180 Kč' },
            { name: 'Barva + Střih (Dlouhé)', price: '1460 - 1660 Kč' },
            { name: 'Melír + Střih (Krátké)', price: '980 - 1180 Kč' },
            { name: 'Melír + Střih (Polodlouhé)', price: '1480 - 1680 Kč' },
            { name: 'Melír + Střih (Dlouhé)', price: '1480 - 2800 Kč' },
            { name: 'Samostatná foukaná', price: '480 - 680 Kč' }
        ],
        'panske': [
            { name: 'Pánský střih klasika', price: '280 Kč' },
            { name: 'Pánský střih business/kreativní', price: 'od 350 Kč' },
            { name: 'Střih strojkem', price: '200 Kč' },
            { name: 'Dětský střih', price: '200 Kč' }
        ],
        'urs': [
            { name: 'URS Kúra (Krátké)', price: '300 Kč' },
            { name: 'URS Kúra (Polodlouhé)', price: '400 Kč' },
            { name: 'URS Kúra (Dlouhé)', price: '500 Kč' }
        ],
        'svatba': [
            { name: 'Zkouška účesu', price: '1500 Kč' },
            { name: 'Svatební účes den D', price: '1800 Kč' },
            { name: 'Svatební balíček (zkouška + den D)', price: '2800 Kč' },
            { name: 'Společenský účes', price: '980 - 1200 Kč' }
        ]
    };

    const openingHours = {
        'damske': {
            1: { start: 10, end: 19 },
            2: { start: 10, end: 19 },
            3: { start: 10, end: 19 },
            4: { start: 10, end: 19 },
            5: { start: 10, end: 15 }
        },
        'default': {
            1: { start: 10, end: 19 },
            2: { start: 10, end: 19 },
            3: { start: 10, end: 19 },
            4: { start: 10, end: 19 },
            5: { start: 10, end: 15 }
        },
        'panske': {
            1: { start: 10, end: 17 },
            2: { start: 13, end: 19 },
            3: { start: 10, end: 19 },
            4: { start: 10, end: 17 },
            5: null
        }
    };

    function updateStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));

        document.getElementById(`step-${step}`).classList.add('active');
        document.querySelector(`.step-indicator[data-step="${step}"]`).classList.add('active');

        if (step === 3) {
            renderStep3();
        }

        currentStep = step;
    }

    function validateStep(step) {
        if (step === 1) {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const personsEl = document.getElementById('people-count');
            const persons = personsEl ? parseInt(personsEl.value) : 1;

            if (!name || !phone || !email) {
                alert('Prosím vyplňte všechna pole.');
                return false;
            }
            if (!emailRegex.test(email)) {
                alert('Prosím zadejte platný email.');
                return false;
            }
            // Minimal length check for phone
            if (phone.length < 9) {
                alert('Prosím zadejte platné telefonní číslo.');
                return false;
            }

            wizardState.name = name;
            wizardState.phone = phone;
            wizardState.email = email;

            // If person count changed, reset selections
            if (wizardState.persons !== persons) {
                wizardState.selections = [];
            }
            wizardState.persons = persons;

            return true;
        }
        if (step === 2) {
            if (wizardState.date && wizardState.time) return true;
            else {
                alert('Prosím vyberte datum a čas.');
                return false;
            }
        }
        // Step 3 validation happens on submission check logic within updateSummary/render
        if (step === 3) {
            // Ensure all persons have a service selected
            const validSelections = wizardState.selections.filter(s => s.service && s.price);
            if (validSelections.length < wizardState.persons) {
                // Trigger alert via submit button logic usually, but here:
                alert("Prosím vyberte službu pro všechny osoby.");
                return false;
            }
            return true;
        }
        return true;
    }

    datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
            const selected = new Date(e.target.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) {
                alert("Prosím vyberte budoucí datum.");
                datePicker.value = '';
                return;
            }
            wizardState.date = e.target.value;
            wizardState.time = '';
            document.getElementById('step-2-next').disabled = true;
            renderTimeSlots();
        }
    });

    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        const dateObj = new Date(wizardState.date);
        const dayOfWeek = dateObj.getDay();
        const config = openingHours['default'];
        const hours = config[dayOfWeek];

        if (!hours) {
            timeSlotsContainer.innerHTML = '<p class="placeholder-text error">V tento den máme zavřeno (Víkend).</p>';
            return;
        }

        for (let h = hours.start; h < hours.end; h++) {
            const timeStr = `${h}:00`;
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.innerText = timeStr;
            div.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                div.classList.add('selected');
                wizardState.time = timeStr;
                document.getElementById('step-2-next').disabled = false;
            });
            timeSlotsContainer.appendChild(div);
        }
    }

    // --- Dynamic Step 3 Rendering ---
    function renderStep3() {
        servicesDynamicContainer.innerHTML = '';

        // Ensure state array size matches persons
        // Preserve existing selections if possible, else init empty
        const oldSelections = [...wizardState.selections];
        wizardState.selections = [];

        for (let i = 0; i < wizardState.persons; i++) {
            const preserved = oldSelections[i] || { category: '', service: '', price: '' };
            wizardState.selections.push(preserved);

            const personIndex = i + 1;
            const container = document.createElement('div');
            container.className = 'person-selection-block';
            container.style.marginBottom = '20px';
            container.style.borderBottom = '1px solid #eee';
            container.style.paddingBottom = '15px';
            if (i > 0) container.style.marginTop = '20px';

            const title = document.createElement('h4');
            title.innerText = `Osoba ${personIndex}`;
            title.style.color = 'var(--dark-grey)';
            title.style.marginBottom = '10px';
            container.appendChild(title);

            // Category Select
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            const label = document.createElement('label');
            label.innerText = 'Kategorie';
            const select = document.createElement('select');
            select.id = `cat-select-${i}`;
            select.innerHTML = `
                <option value="" disabled ${!preserved.category ? 'selected' : ''}>-- Vyberte kategorii --</option>
                <option value="damske">Dámské kadeřnictví</option>
                <option value="panske">Pánské kadeřnictví</option>
                <option value="urs">URS System (Regenerace)</option>
                <option value="svatba">Svatební / Společenské</option>
            `;

            // Apply Filtering Logic to this select
            applyFilteringToSelect(select);

            // Container for radio options
            const optionsContainer = document.createElement('div');
            optionsContainer.id = `services-options-${i}`;
            optionsContainer.className = 'service-options-container';

            // Pre-render options if category already selected
            if (preserved.category) {
                select.value = preserved.category;
                renderServiceOptions(i, preserved.category, optionsContainer, preserved.service);
            }

            select.addEventListener('change', (e) => {
                wizardState.selections[i].category = e.target.value;
                wizardState.selections[i].service = '';
                wizardState.selections[i].price = '';
                renderServiceOptions(i, e.target.value, optionsContainer, '');
                updateSummary();
            });

            formGroup.appendChild(label);
            formGroup.appendChild(select);
            container.appendChild(formGroup);
            container.appendChild(optionsContainer);

            servicesDynamicContainer.appendChild(container);
        }
        updateSummary();
    }

    function applyFilteringToSelect(selectElement) {
        if (!wizardState.date || !wizardState.time) return;
        const dateObj = new Date(wizardState.date);
        const dayOfWeek = dateObj.getDay();
        const selectedHour = parseInt(wizardState.time.split(':')[0]);

        // Helper to check availability
        const check = (type) => {
            const hours = openingHours[type][dayOfWeek];
            if (!hours) return false; // Closed that day
            if (selectedHour < hours.start || selectedHour >= hours.end) return false; // Closed at that time
            return true;
        };

        // Check Panske
        if (!check('panske')) {
            const opt = selectElement.querySelector('option[value="panske"]');
            if (opt) {
                opt.disabled = true;
                opt.innerText += ' (Nedostupné)';
            }
        }
        // Check Damske/Other (Assuming same hours for simplicity logic here)
        if (!check('damske')) {
            ['damske', 'urs', 'svatba'].forEach(val => {
                const opt = selectElement.querySelector(`option[value="${val}"]`);
                if (opt) {
                    opt.disabled = true;
                    opt.innerText += ' (Nedostupné)';
                }
            });
        }
    }

    function renderServiceOptions(personIdx, category, container, selectedService) {
        container.innerHTML = '';
        const list = servicesData[category];
        if (!list) return;

        list.forEach((item, idx) => {
            const uniqueId = `p${personIdx}-s${idx}`;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `service-p${personIdx}`; // Unique group name per person
            radio.id = uniqueId;
            radio.value = item.name;
            radio.className = 'service-option-input';

            if (item.name === selectedService) radio.checked = true;

            radio.addEventListener('change', () => {
                wizardState.selections[personIdx].service = item.name;
                wizardState.selections[personIdx].price = item.price;
                updateSummary();
            });

            const label = document.createElement('label');
            label.htmlFor = uniqueId;
            label.className = 'service-option-label';
            label.innerHTML = `
                <span class="service-name">${item.name}</span>
                <span class="service-price">${item.price}</span>
            `;

            container.appendChild(radio);
            container.appendChild(label);
        });
    }

    if (noteInput) {
        noteInput.addEventListener('input', (e) => {
            wizardState.note = e.target.value;
            updateSummary();
        });
    }

    // Helper to parse price string to min/max numbers
    function parsePrice(priceStr) {
        const matches = priceStr.match(/\d+/g);
        if (!matches) return { min: 0, max: 0 };
        if (matches.length === 1) {
            const v = parseInt(matches[0]);
            return { min: v, max: v };
        }
        return { min: parseInt(matches[0]), max: parseInt(matches[1]) };
    }

    function updateSummary() {
        const summaryBox = document.getElementById('summary-box');
        const summaryText = document.getElementById('summary-text');
        const submitBtn = document.getElementById('submit-booking');

        // Check if all persons have selected a service
        const allSelected = wizardState.selections.length === wizardState.persons &&
            wizardState.selections.every(s => s.service && s.price);

        if (allSelected) {
            summaryBox.classList.remove('hidden');
            submitBtn.disabled = false;

            // Calculate Total
            let totalMin = 0;
            let totalMax = 0;
            let detailsHtml = '';

            wizardState.selections.forEach((sel, i) => {
                const { min, max } = parsePrice(sel.price);
                totalMin += min;
                totalMax += max;
                detailsHtml += `<div class="summary-subrow" style="font-size:0.9em; margin-bottom:4px; margin-left:10px;">
                    Osoba ${i + 1}: ${sel.service} (${sel.price})
                </div>`;
            });

            const totalStr = totalMin === totalMax ? `${totalMin} Kč` : `${totalMin} - ${totalMax} Kč`;
            let noteHtml = wizardState.note
                ? `<div class="summary-row" style="margin-top:10px; border-top:1px dashed #eee; padding-top:5px;"><em>Poznámka: ${wizardState.note}</em></div>`
                : '';

            summaryText.innerHTML = `
                <div class="summary-row"><strong>Jméno:</strong> <span>${wizardState.name}</span></div>
                <div class="summary-row"><strong>Datum:</strong> <span>${wizardState.date} v ${wizardState.time}</span></div>
                <div class="summary-row"><strong>Služby (${wizardState.persons}):</strong></div>
                ${detailsHtml}
                ${noteHtml}
                <div class="summary-total">
                    <span>Odhadovaná cena:</span>
                    <span class="total-price">${totalStr}</span>
                </div>
            `;
        } else {
            summaryBox.classList.add('hidden');
            submitBtn.disabled = true;
        }
    }

    // Buttons
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep) && currentStep < totalSteps) {
                updateStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) updateStep(currentStep - 1);
        });
    });

    // Final Submit
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Final validation check just in case
            if (!validateStep(3)) return;

            const submitBtn = document.getElementById('submit-booking');
            submitBtn.disabled = true;
            submitBtn.innerText = "Odesílám...";

            try {
                // Split name if possible for surname (optional, but requested in server entity)
                // wizardState.name is currently full name from input

                const payload = {
                    ...wizardState,
                    submittedAt: new Date().toISOString()
                };

                const response = await fetch('/api/saveOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(`Děkujeme, ${wizardState.name}! Vaše rezervace pro ${wizardState.persons} osoby na ${wizardState.date} v ${wizardState.time} byla úspěšně uložena.`);
                    location.reload();
                } else {
                    throw new Error('Server returned error');
                }
            } catch (error) {
                console.error("Booking Error:", error);
                alert("Omlouváme se, došlo k chybě při ukládání rezervace. Zkuste to prosím znovu nebo zavolejte na recepci.");
                submitBtn.disabled = false;
                submitBtn.innerText = "Odeslat Rezervaci";
            }
        });
    }

});

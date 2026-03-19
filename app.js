// ===== AEGIS Vault — Password Manager (Enhanced) =====

(function() {
    'use strict';

    // ===== Constants =====
    const STORAGE_KEY = 'aegis_vault_passwords';

    // SVG icons for each category
    const CATEGORY_SVG = {
        social: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        finance: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        gaming: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="0.5" fill="currentColor"/><circle cx="18" cy="13" r="0.5" fill="currentColor"/></svg>',
        work: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        shopping: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
        other: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    };

    const CATEGORY_LABELS = {
        social: 'โซเชียล',
        email: 'อีเมล',
        finance: 'การเงิน',
        gaming: 'เกม',
        work: 'งาน',
        shopping: 'ช้อปปิ้ง',
        other: 'อื่นๆ'
    };

    // ===== DOM Elements =====
    const $ = id => document.getElementById(id);
    const passwordList     = $('passwordList');
    const emptyState       = $('emptyState');
    const searchInput      = $('searchInput');
    const totalCount       = $('totalCount');
    const categoryCount    = $('categoryCount');
    const btnAdd           = $('btnAdd');
    const modalOverlay     = $('modalOverlay');
    const modalTitle       = $('modalTitle');
    const passwordForm     = $('passwordForm');
    const entryName        = $('entryName');
    const entryUsername    = $('entryUsername');
    const entryPassword   = $('entryPassword');
    const entryNote        = $('entryNote');
    const entryId          = $('entryId');
    const btnCloseModal    = $('btnCloseModal');
    const btnCancel        = $('btnCancel');
    const btnTogglePw      = $('btnTogglePw');
    const categorySelector = $('categorySelector');
    const deleteModalOverlay = $('deleteModalOverlay');
    const deleteEntryName  = $('deleteEntryName');
    const btnCancelDelete  = $('btnCancelDelete');
    const btnConfirmDelete = $('btnConfirmDelete');
    const toast            = $('toast');
    const toastMessage     = $('toastMessage');
    const passwordStrength = $('passwordStrength');
    const strengthFill     = $('strengthFill');
    const strengthText     = $('strengthText');
    const btnGeneratePw    = $('btnGeneratePw');

    let passwords = [];
    let selectedCategory = 'social';
    let deleteTargetId = null;
    let activeFilter = 'all';

    // ===== Password Generator =====
    function generatePassword(length = 16) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const symbols = '!@#$%^&*_+-=?';
        const all = uppercase + lowercase + digits + symbols;

        // Ensure at least one of each type
        let pw = [
            uppercase[Math.floor(Math.random() * uppercase.length)],
            lowercase[Math.floor(Math.random() * lowercase.length)],
            digits[Math.floor(Math.random() * digits.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        for (let i = pw.length; i < length; i++) {
            pw.push(all[Math.floor(Math.random() * all.length)]);
        }

        // Shuffle
        for (let i = pw.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pw[i], pw[j]] = [pw[j], pw[i]];
        }

        return pw.join('');
    }

    // ===== Storage =====
    function loadPasswords() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            passwords = data ? JSON.parse(data) : [];
        } catch {
            passwords = [];
        }
    }

    function savePasswords() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
    }

    // ===== Simple obfuscation =====
    function encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function decode(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch {
            return str;
        }
    }

    // ===== Password Strength =====
    function checkPasswordStrength(pw) {
        if (!pw) return { level: '', label: '', score: 0 };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^a-zA-Z0-9]/.test(pw)) score++;

        if (score <= 1) return { level: 'weak', label: 'อ่อน', score };
        if (score <= 2) return { level: 'fair', label: 'พอใช้', score };
        if (score <= 3) return { level: 'good', label: 'ดี', score };
        return { level: 'strong', label: 'แข็งแรง', score };
    }

    function updateStrengthIndicator(pw) {
        const { level, label } = checkPasswordStrength(pw);
        if (!pw) {
            passwordStrength.classList.remove('visible');
            return;
        }
        passwordStrength.classList.add('visible');
        strengthFill.className = 'strength-fill ' + level;
        strengthText.className = 'strength-text ' + level;
        strengthText.textContent = label;
    }

    // ===== Render =====
    function render(filter = '') {
        // Remove existing cards
        const cards = passwordList.querySelectorAll('.password-card');
        cards.forEach(c => c.remove());

        const query = filter.toLowerCase().trim();
        const filtered = passwords.filter(p => {
            // Category filter
            if (activeFilter !== 'all' && p.category !== activeFilter) return false;
            // Text search
            if (!query) return true;
            return p.name.toLowerCase().includes(query)
                || (CATEGORY_LABELS[p.category] || '').toLowerCase().includes(query)
                || decode(p.username).toLowerCase().includes(query);
        });

        // Show/hide empty state
        emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';

        // Animate stats
        animateNumber(totalCount, passwords.length);
        const cats = new Set(passwords.map(p => p.category));
        animateNumber(categoryCount, cats.size);

        // Update filter counts
        updateFilterCounts();

        // Render cards with staggered animation
        filtered.forEach((entry, index) => {
            const card = createCard(entry);
            card.style.animationDelay = `${index * 0.06}s`;
            card.classList.add('reveal');
            passwordList.appendChild(card);
        });

        // Setup intersection observer for reveal
        setupScrollReveal();
    }

    function updateFilterCounts() {
        const allCountEl = document.getElementById('filterCountAll');
        if (allCountEl) allCountEl.textContent = passwords.length;

        // Update each filter button count
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            const cat = btn.dataset.filter;
            if (cat === 'all') return;
            let count = passwords.filter(p => p.category === cat).length;
            let badge = btn.querySelector('.filter-count');
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'filter-count';
                    btn.appendChild(badge);
                }
                badge.textContent = count;
            } else if (badge) {
                badge.remove();
            }
        });
    }

    // ===== Animate number counter =====
    function animateNumber(el, target) {
        const current = parseInt(el.textContent) || 0;
        if (current === target) return;
        const duration = 400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.round(current + (target - current) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function createCard(entry) {
        const catLabel = CATEGORY_LABELS[entry.category] || CATEGORY_LABELS.other;
        const catSVG = CATEGORY_SVG[entry.category] || CATEGORY_SVG.other;
        const card = document.createElement('div');
        card.className = 'password-card';

        const maskedPw = '•'.repeat(Math.min(decode(entry.password).length, 12));

        card.innerHTML = `
            <div class="card-top">
                <div class="card-info">
                    <div class="card-icon ${entry.category}">
                        ${catSVG}
                    </div>
                    <div>
                        <div class="card-title">${escapeHtml(entry.name)}</div>
                        <div class="card-category">${catLabel}</div>
                    </div>
                </div>
                <div class="card-actions-top">
                    <button class="btn-icon edit" data-id="${entry.id}" title="แก้ไข">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" data-id="${entry.id}" data-name="${escapeHtml(entry.name)}" title="ลบ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="card-credentials">
                <div class="credential-row">
                    <span class="credential-label">User</span>
                    <span class="credential-value">${escapeHtml(decode(entry.username))}</span>
                    <button class="btn-copy" data-copy="${escapeAttr(decode(entry.username))}" title="คัดลอก Username">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span>คัดลอก</span>
                    </button>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Pass</span>
                    <span class="credential-value masked">${maskedPw}</span>
                    <button class="btn-copy" data-copy="${escapeAttr(decode(entry.password))}" title="คัดลอก Password">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span>คัดลอก</span>
                    </button>
                </div>
            </div>
            ${entry.note ? `<div class="card-note">${escapeHtml(entry.note)}</div>` : ''}
        `;

        // Interactive tilt effect on mouse move
        card.addEventListener('mousemove', handleCardTilt);
        card.addEventListener('mouseleave', resetCardTilt);

        return card;
    }

    // ===== Card Tilt Effect =====
    function handleCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    }

    function resetCardTilt(e) {
        e.currentTarget.style.transform = '';
    }

    // ===== Scroll Reveal =====
    function setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.password-card').forEach(card => {
            observer.observe(card);
        });
    }

    // ===== Helpers =====
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ===== Modal =====
    function openModal(editEntry = null) {
        if (editEntry) {
            modalTitle.textContent = 'แก้ไขรหัสผ่าน';
            entryName.value = editEntry.name;
            entryUsername.value = decode(editEntry.username);
            entryPassword.value = decode(editEntry.password);
            entryNote.value = editEntry.note || '';
            entryId.value = editEntry.id;
            setActiveCategory(editEntry.category);
            updateStrengthIndicator(decode(editEntry.password));
        } else {
            modalTitle.textContent = 'เพิ่มรหัสผ่านใหม่';
            passwordForm.reset();
            entryId.value = '';
            setActiveCategory('social');
            updateStrengthIndicator('');
        }
        // Reset password toggle
        entryPassword.type = 'password';
        btnTogglePw.querySelector('.eye-open').style.display = '';
        btnTogglePw.querySelector('.eye-closed').style.display = 'none';

        modalOverlay.classList.add('active');
        setTimeout(() => entryName.focus(), 350);
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    function setActiveCategory(cat) {
        selectedCategory = cat;
        categorySelector.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === cat);
        });
    }

    // ===== Delete Modal =====
    function openDeleteModal(id, name) {
        deleteTargetId = id;
        deleteEntryName.textContent = `ลบ "${name}" ใช่หรือไม่?`;
        deleteModalOverlay.classList.add('active');
    }

    function closeDeleteModal() {
        deleteModalOverlay.classList.remove('active');
        deleteTargetId = null;
    }

    // ===== Copy =====
    async function copyToClipboard(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        btn.classList.add('copied');
        const origHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>สำเร็จ!</span>
        `;
        showToast('คัดลอกสำเร็จ!');
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = origHTML;
        }, 1800);
    }

    // ===== Event Listeners =====

    // Add button
    btnAdd.addEventListener('click', () => openModal());

    // Close modal
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });

    // Delete modal
    btnCancelDelete.addEventListener('click', closeDeleteModal);
    deleteModalOverlay.addEventListener('click', e => {
        if (e.target === deleteModalOverlay) closeDeleteModal();
    });

    btnConfirmDelete.addEventListener('click', () => {
        if (deleteTargetId) {
            passwords = passwords.filter(p => p.id !== deleteTargetId);
            savePasswords();
            render(searchInput.value);
            showToast('ลบเรียบร้อยแล้ว');
        }
        closeDeleteModal();
    });

    // Filter bar (category filter)
    const filterBar = document.getElementById('filterBar');
    if (filterBar) {
        filterBar.addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            const filterValue = btn.dataset.filter;
            activeFilter = filterValue;

            // Update active styles
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render with current search
            render(searchInput.value);
        });
    }

    // Category buttons
    categorySelector.addEventListener('click', e => {
        const btn = e.target.closest('.cat-btn');
        if (btn) setActiveCategory(btn.dataset.cat);
    });

    // Toggle password visibility
    btnTogglePw.addEventListener('click', () => {
        const isPass = entryPassword.type === 'password';
        entryPassword.type = isPass ? 'text' : 'password';
        btnTogglePw.querySelector('.eye-open').style.display = isPass ? 'none' : '';
        btnTogglePw.querySelector('.eye-closed').style.display = isPass ? '' : 'none';
    });

    // Password strength real-time
    entryPassword.addEventListener('input', () => {
        updateStrengthIndicator(entryPassword.value);
    });

    // Generate password button
    btnGeneratePw.addEventListener('click', () => {
        const pw = generatePassword(16);
        entryPassword.value = pw;
        entryPassword.type = 'text';
        btnTogglePw.querySelector('.eye-open').style.display = 'none';
        btnTogglePw.querySelector('.eye-closed').style.display = '';
        updateStrengthIndicator(pw);
        showToast('สุ่มรหัสผ่านใหม่แล้ว');

        // Animate the button
        btnGeneratePw.classList.add('generated');
        setTimeout(() => btnGeneratePw.classList.remove('generated'), 800);
    });

    // Form submit
    passwordForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = entryId.value;
        const entry = {
            id: id || generateId(),
            name: entryName.value.trim(),
            category: selectedCategory,
            username: encode(entryUsername.value),
            password: encode(entryPassword.value),
            note: entryNote.value.trim(),
            updatedAt: new Date().toISOString()
        };

        if (id) {
            const idx = passwords.findIndex(p => p.id === id);
            if (idx !== -1) {
                entry.createdAt = passwords[idx].createdAt;
                passwords[idx] = entry;
            }
        } else {
            entry.createdAt = new Date().toISOString();
            passwords.unshift(entry);
        }

        savePasswords();
        closeModal();
        render(searchInput.value);
        showToast(id ? 'แก้ไขเรียบร้อยแล้ว' : 'เพิ่มรหัสผ่านเรียบร้อยแล้ว');
    });

    // Delegated events for cards
    passwordList.addEventListener('click', e => {
        const copyBtn = e.target.closest('.btn-copy');
        if (copyBtn) {
            copyToClipboard(copyBtn.dataset.copy, copyBtn);
            return;
        }

        const editBtn = e.target.closest('.btn-icon.edit');
        if (editBtn) {
            const entry = passwords.find(p => p.id === editBtn.dataset.id);
            if (entry) openModal(entry);
            return;
        }

        const deleteBtn = e.target.closest('.btn-icon.delete');
        if (deleteBtn) {
            openDeleteModal(deleteBtn.dataset.id, deleteBtn.dataset.name);
            return;
        }
    });

    // Search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => render(searchInput.value), 200);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (deleteModalOverlay.classList.contains('active')) {
                closeDeleteModal();
            } else if (modalOverlay.classList.contains('active')) {
                closeModal();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal();
        }
    });

    // ===== Init =====
    loadPasswords();
    render();

})();


// ===== AEGIS Vault — Password Manager (Enhanced) =====

(function() {
    'use strict';

    // ===== Constants =====
    const STORAGE_KEY = 'aegis_vault_passwords';
    const CATEGORY_STORAGE_KEY = 'aegis_vault_categories';

    // ===== Preset Icons (SVG) =====
    const ICON_PRESETS = {
        monitor: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        gamepad: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>',
        mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        'credit-card': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        'shopping-bag': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        briefcase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        lock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    };

    const ICON_LABELS = {
        monitor: 'จอ', users: 'ทีม', folder: 'โฟลเดอร์', gamepad: 'เกม',
        mail: 'อีเมล', 'credit-card': 'การเงิน', 'shopping-bag': 'ช้อปปิ้ง',
        briefcase: 'งาน', globe: 'เว็บ', lock: 'ความปลอดภัย'
    };

    const COLOR_PRESETS = [
        '#81ecff', '#a78bfa', '#ff6b6b', '#fbbf24',
        '#34d399', '#f472b6', '#60a5fa', '#fb923c'
    ];

    // ===== Default categories (built-in, cannot be deleted) =====
    const DEFAULT_CATEGORIES = [
        { id: 'playid', label: 'PlayID', icon: 'monitor', color: '#81ecff', isDefault: true },
        { id: 'team', label: 'Team', icon: 'users', color: '#a78bfa', isDefault: true },
        { id: 'other', label: 'อื่นๆ', icon: 'folder', color: '#fb923c', isDefault: true }
    ];

    // ===== Custom Category System =====
    let customCategories = [];

    function loadCategories() {
        try {
            const data = localStorage.getItem(CATEGORY_STORAGE_KEY);
            customCategories = data ? JSON.parse(data) : [];
        } catch { customCategories = []; }
    }

    function saveCategories() {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(customCategories));
    }

    function getAllCategories() {
        return [...DEFAULT_CATEGORIES, ...customCategories];
    }

    function getCategoryById(catId) {
        return getAllCategories().find(c => c.id === catId) || DEFAULT_CATEGORIES[2]; // fallback to "other"
    }

    function getCategoryIcon(catId) {
        const cat = getCategoryById(catId);
        return ICON_PRESETS[cat.icon] || ICON_PRESETS.folder;
    }

    function getCategoryLabel(catId) {
        const cat = getCategoryById(catId);
        return cat.label;
    }

    function getCategoryColor(catId) {
        const cat = getCategoryById(catId);
        return cat.color || '#fb923c';
    }

    // Legacy compat — these are still used by render/createCard
    function get_CATEGORY_SVG() {
        const obj = {};
        getAllCategories().forEach(c => { obj[c.id] = ICON_PRESETS[c.icon] || ICON_PRESETS.folder; });
        return obj;
    }
    function get_CATEGORY_LABELS() {
        const obj = {};
        getAllCategories().forEach(c => { obj[c.id] = c.label; });
        return obj;
    }

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
    let selectedCategory = 'playid';
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
                || getCategoryLabel(p.category).toLowerCase().includes(query)
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
        const catLabel = getCategoryLabel(entry.category);
        const catSVG = getCategoryIcon(entry.category);
        const card = document.createElement('div');
        card.className = 'password-card';

        const maskedPw = '•'.repeat(Math.min(decode(entry.password).length, 12));

        card.innerHTML = `
            <div class="card-top">
                <div class="card-info">
                    <div class="card-icon" style="color: ${getCategoryColor(entry.category)}">
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
                    <span class="credential-value masked" data-real-pw="${escapeAttr(decode(entry.password))}" data-masked="${maskedPw}">${maskedPw}</span>
                    <button class="btn-icon toggle-pw-card" title="แสดง/ซ่อนรหัสผ่าน">
                        <svg class="eye-show" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg class="eye-hide" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
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
            setActiveCategory('playid');
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

        const toggleBtn = e.target.closest('.toggle-pw-card');
        if (toggleBtn) {
            const valSpan = toggleBtn.parentElement.querySelector('.credential-value');
            const showIcon = toggleBtn.querySelector('.eye-show');
            const hideIcon = toggleBtn.querySelector('.eye-hide');
            
            if (valSpan.classList.contains('masked')) {
                // Show real password
                valSpan.textContent = valSpan.dataset.realPw;
                valSpan.classList.remove('masked');
                showIcon.style.display = 'none';
                hideIcon.style.display = 'block';
            } else {
                // Hide password
                valSpan.textContent = valSpan.dataset.masked;
                valSpan.classList.add('masked');
                showIcon.style.display = 'block';
                hideIcon.style.display = 'none';
            }
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
        searchTimeout = setTimeout(() => {
            if (currentView === 'passwords') {
                render(searchInput.value);
            } else if (currentView === 'urls') {
                renderUrls(searchInput.value);
            } else {
                renderDashboard(searchInput.value);
            }
        }, 200);
    });

    // ===== SIDEBAR NAVIGATION =====
    let currentView = 'dashboard';
    const sidebarNav = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view[data-view]');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    function switchView(viewName) {
        if (viewName === currentView) return;
        currentView = viewName;

        // Update nav active state
        sidebarNav.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Switch view
        views.forEach(v => {
            v.classList.toggle('active', v.dataset.view === viewName);
        });

        // Update search placeholder
        if (viewName === 'passwords') {
            searchInput.placeholder = 'ค้นหารหัสผ่าน...';
            render(searchInput.value);
        } else if (viewName === 'urls') {
            searchInput.placeholder = 'ค้นหา URL...';
            renderUrls(searchInput.value);
        } else {
            searchInput.placeholder = 'ค้นหา...';
            renderDashboard(searchInput.value);
        }

        // Close sidebar on mobile
        if (sidebar) sidebar.classList.remove('open');
    }

    sidebarNav.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // ===== DASHBOARD RENDERING =====
    const dashPasswordGrid = document.getElementById('dashPasswordGrid');
    const dashUrlGrid = document.getElementById('dashUrlGrid');

    function renderDashboard(filter = '') {
        const query = filter.toLowerCase().trim();

        // Filter and show latest 6 passwords
        let filteredPw = passwords;
        if (query) {
            filteredPw = passwords.filter(p =>
                p.name.toLowerCase().includes(query)
                || getCategoryLabel(p.category).toLowerCase().includes(query)
                || decode(p.username).toLowerCase().includes(query)
            );
        }
        const recentPw = filteredPw.slice(-6).reverse();
        dashPasswordGrid.innerHTML = '';
        recentPw.forEach(entry => {
            const cat = entry.category || 'other';
            const label = getCategoryLabel(cat);
            const icon = getCategoryIcon(cat);
            const card = document.createElement('div');
            card.className = 'password-card reveal';
            card.innerHTML = `
                <div class="card-top">
                    <div class="card-info">
                        <div class="card-icon" style="color: ${getCategoryColor(cat)}">${icon}</div>
                        <div style="min-width:0">
                            <div class="card-title">${entry.name}</div>
                            <div class="card-category">${decode(entry.username)}</div>
                        </div>
                    </div>
                </div>
                ${entry.note ? `<div class="card-note">${entry.note}</div>` : ''}
                <div style="margin-top:10px">
                    <button class="btn-copy" data-copy-user="${encode(entry.username)}" style="width:100%;justify-content:center;padding:8px 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        <span>Copy Password</span>
                    </button>
                </div>
            `;
            // Wire up copy
            const copyBtn = card.querySelector('.btn-copy');
            copyBtn.addEventListener('click', () => {
                copyToClipboard(decode(entry.password), copyBtn);
            });
            dashPasswordGrid.appendChild(card);
        });

        if (recentPw.length === 0) {
            dashPasswordGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; padding: 20px;">ยังไม่มีรหัสผ่าน — กด "เพิ่มใหม่" เพื่อเริ่มต้น</p>';
        }

        // Filter and show latest 6 URLs
        let filteredUrls = urlEntries;
        if (query) {
            filteredUrls = urlEntries.filter(u =>
                u.name.toLowerCase().includes(query)
                || u.url.toLowerCase().includes(query)
                || (URL_CATEGORY_LABELS[u.category] || '').toLowerCase().includes(query)
            );
        }
        const recentUrls = filteredUrls.slice(-6).reverse();
        dashUrlGrid.innerHTML = '';
        recentUrls.forEach(entry => {
            const catLabel = URL_CATEGORY_LABELS[entry.category] || URL_CATEGORY_LABELS.other;
            const catSVG = URL_CATEGORY_SVG[entry.category] || URL_CATEGORY_SVG.other;
            const card = document.createElement('div');
            card.className = 'password-card reveal';
            card.innerHTML = `
                <div class="card-top">
                    <div class="card-info">
                        <div class="card-favicon ${entry.category}">${catSVG}</div>
                        <div style="min-width:0">
                            <div class="card-title">${entry.name}</div>
                            <div class="card-category">${catLabel}</div>
                        </div>
                    </div>
                </div>
                <div class="url-actions-row">
                    <a class="btn-open-url" href="${entry.url}" target="_blank" rel="noopener">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        <span>เปิดลิงก์</span>
                    </a>
                </div>
            `;
            dashUrlGrid.appendChild(card);
        });

        if (recentUrls.length === 0) {
            dashUrlGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; padding: 20px;">ยังไม่มี URL — กด "เพิ่มใหม่" เพื่อเริ่มต้น</p>';
        }

        // Update welcome stats
        animateNumber(totalCount, passwords.length);
        const urlCountEl = document.getElementById('urlCount');
        if (urlCountEl) animateNumber(urlCountEl, urlEntries.length);
        const cats = new Set(passwords.map(p => p.category).concat(urlEntries.map(u => u.category)));
        animateNumber(categoryCount, cats.size);
    }

    // ===== "Add New" button — context-sensitive =====
    btnAdd.addEventListener('click', () => {
        if (currentView === 'urls') {
            openUrlModal();
        } else {
            openModal();
        }
    });

    // ===== URL BOOKMARKS SYSTEM =====
    const URL_STORAGE_KEY = 'aegis_vault_urls';
    let urlEntries = [];
    let urlActiveFilter = 'all';
    let urlSelectedCategory = 'livezone';
    let urlDeleteTargetId = null;

    const URL_CATEGORY_LABELS = {
        livezone: 'LiveZone',
        testzone: 'TestZone',
        team: 'Team',
        other: 'อื่นๆ'
    };

    // URL DOM references
    const urlList = document.getElementById('urlList');
    const urlEmptyState = document.getElementById('urlEmptyState');
    const urlModalOverlay = document.getElementById('urlModalOverlay');
    const urlModalTitle = document.getElementById('urlModalTitle');
    const urlForm = document.getElementById('urlForm');
    const urlEntryName = document.getElementById('urlEntryName');
    const urlEntryUrl = document.getElementById('urlEntryUrl');
    const urlEntryNote = document.getElementById('urlEntryNote');
    const urlEntryId = document.getElementById('urlEntryId');
    const btnCloseUrlModal = document.getElementById('btnCloseUrlModal');
    const btnCancelUrl = document.getElementById('btnCancelUrl');
    const urlCategorySelector = document.getElementById('urlCategorySelector');
    const urlFilterBar = document.getElementById('urlFilterBar');
    const urlCountEl = document.getElementById('urlCount');

    // Load / Save URLs
    function loadUrls() {
        try {
            const data = localStorage.getItem(URL_STORAGE_KEY);
            urlEntries = data ? JSON.parse(data) : [];
        } catch { urlEntries = []; }
    }

    function saveUrls() {
        localStorage.setItem(URL_STORAGE_KEY, JSON.stringify(urlEntries));
    }

    // Get favicon URL
    function getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    }

    // Render URLs
    function renderUrls(filter = '') {
        const cards = urlList.querySelectorAll('.password-card');
        cards.forEach(c => c.remove());

        const query = filter.toLowerCase().trim();
        const filtered = urlEntries.filter(u => {
            if (urlActiveFilter !== 'all' && u.category !== urlActiveFilter) return false;
            if (!query) return true;
            return u.name.toLowerCase().includes(query)
                || u.url.toLowerCase().includes(query)
                || (URL_CATEGORY_LABELS[u.category] || '').toLowerCase().includes(query);
        });

        urlEmptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
        animateNumber(urlCountEl, urlEntries.length);
        updateUrlFilterCounts();

        filtered.forEach((entry, index) => {
            const card = createUrlCard(entry);
            card.style.animationDelay = `${index * 0.06}s`;
            card.classList.add('reveal');
            urlList.appendChild(card);
        });
    }

    // URL category SVG icons
    const URL_CATEGORY_SVG = {
        livezone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
        testzone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        team: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        other: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    };

    function createUrlCard(entry) {
        const catLabel = URL_CATEGORY_LABELS[entry.category] || URL_CATEGORY_LABELS.other;
        const catSVG = URL_CATEGORY_SVG[entry.category] || URL_CATEGORY_SVG.other;
        const faviconSrc = getFaviconUrl(entry.url);
        const card = document.createElement('div');
        card.className = 'password-card';

        let displayUrl = entry.url;
        try { displayUrl = new URL(entry.url).hostname; } catch {}

        card.innerHTML = `
            <div class="card-top">
                <div class="card-info">
                    <div class="card-favicon ${entry.category}">
                        ${catSVG}
                    </div>
                    <div>
                        <div class="card-title">${escapeHtml(entry.name)}</div>
                        <div class="card-url">${escapeHtml(displayUrl)}</div>
                        <div class="card-category">${catLabel}</div>
                    </div>
                </div>
                <div class="card-actions-top">
                    <button class="btn-icon edit" data-url-id="${entry.id}" title="แก้ไข">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" data-url-id="${entry.id}" data-name="${escapeHtml(entry.name)}" title="ลบ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${entry.note ? `<div class="card-note">${escapeHtml(entry.note)}</div>` : ''}
            <div class="url-actions-row">
                <a class="btn-open-url" href="${escapeAttr(entry.url)}" target="_blank" rel="noopener noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    เปิดลิงก์
                </a>
                <button class="btn-copy-url" data-copy-url="${escapeAttr(entry.url)}" title="คัดลอก URL">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    คัดลอก
                </button>
            </div>
        `;
        return card;
    }

    function updateUrlFilterCounts() {
        const allCountEl = document.getElementById('urlFilterCountAll');
        if (allCountEl) allCountEl.textContent = urlEntries.length;

        if (urlFilterBar) {
            urlFilterBar.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
                const cat = btn.dataset.filter;
                if (cat === 'all') return;
                let count = urlEntries.filter(u => u.category === cat).length;
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
    }

    // URL Modal
    function openUrlModal(entry = null) {
        if (entry) {
            urlModalTitle.textContent = 'แก้ไข URL';
            urlEntryName.value = entry.name;
            urlEntryUrl.value = entry.url;
            urlEntryNote.value = entry.note || '';
            urlEntryId.value = entry.id;
            setActiveUrlCategory(entry.category);
        } else {
            urlModalTitle.textContent = 'เพิ่ม URL ใหม่';
            urlForm.reset();
            urlEntryId.value = '';
            setActiveUrlCategory('livezone');
        }
        urlModalOverlay.classList.add('active');
    }

    function closeUrlModal() {
        urlModalOverlay.classList.remove('active');
    }

    function setActiveUrlCategory(cat) {
        urlSelectedCategory = cat;
        urlCategorySelector.querySelectorAll('.cat-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === cat);
        });
    }

    // URL Events
    btnCloseUrlModal.addEventListener('click', closeUrlModal);
    btnCancelUrl.addEventListener('click', closeUrlModal);
    urlModalOverlay.addEventListener('click', e => {
        if (e.target === urlModalOverlay) closeUrlModal();
    });

    urlCategorySelector.addEventListener('click', e => {
        const btn = e.target.closest('.cat-btn');
        if (btn) setActiveUrlCategory(btn.dataset.cat);
    });

    urlForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = urlEntryId.value || Date.now().toString(36) + Math.random().toString(36).slice(2);
        const entry = {
            id,
            name: urlEntryName.value.trim(),
            url: urlEntryUrl.value.trim(),
            category: urlSelectedCategory,
            note: urlEntryNote.value.trim(),
            createdAt: urlEntryId.value ? (urlEntries.find(u => u.id === id)?.createdAt || Date.now()) : Date.now(),
            updatedAt: Date.now()
        };

        if (urlEntryId.value) {
            const idx = urlEntries.findIndex(u => u.id === id);
            if (idx !== -1) urlEntries[idx] = entry;
        } else {
            urlEntries.push(entry);
        }

        saveUrls();
        renderUrls(searchInput.value);
        closeUrlModal();
        showToast(urlEntryId.value ? 'แก้ไข URL สำเร็จ' : 'เพิ่ม URL ใหม่แล้ว');
    });

    // URL Filter bar
    if (urlFilterBar) {
        urlFilterBar.addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            urlActiveFilter = btn.dataset.filter;
            urlFilterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderUrls(searchInput.value);
        });
    }

    // URL List delegation (copy + edit + delete)
    urlList.addEventListener('click', e => {
        // Copy URL
        const copyBtn = e.target.closest('.btn-copy-url');
        if (copyBtn) {
            const url = copyBtn.dataset.copyUrl;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.querySelector('svg + *').textContent = 'คัดลอกแล้ว!';
                showToast('คัดลอก URL สำเร็จ');
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.querySelector('svg + *').textContent = 'คัดลอก';
                }, 2000);
            });
            return;
        }

        // Edit
        const editBtn = e.target.closest('.btn-icon.edit[data-url-id]');
        if (editBtn) {
            const entry = urlEntries.find(u => u.id === editBtn.dataset.urlId);
            if (entry) openUrlModal(entry);
            return;
        }

        // Delete
        const deleteBtn = e.target.closest('.btn-icon.delete[data-url-id]');
        if (deleteBtn) {
            urlDeleteTargetId = deleteBtn.dataset.urlId;
            deleteEntryName.textContent = `คุณต้องการลบ "${deleteBtn.dataset.name}" ใช่หรือไม่?`;
            deleteModalOverlay.querySelector('h2').textContent = 'ลบ URL นี้?';
            deleteModalOverlay.classList.add('active');
            return;
        }
    });

    // Override delete confirm for URL context
    const origDeleteHandler = btnConfirmDelete.onclick;
    btnConfirmDelete.addEventListener('click', () => {
        if (urlDeleteTargetId && currentView === 'urls') {
            urlEntries = urlEntries.filter(u => u.id !== urlDeleteTargetId);
            saveUrls();
            renderUrls(searchInput.value);
            showToast('ลบ URL เรียบร้อยแล้ว');
            urlDeleteTargetId = null;
            closeDeleteModal();
        }
    });

    // ===== DYNAMIC FILTER BAR =====
    function renderFilterBar() {
        const filterBar = document.getElementById('filterBar');
        if (!filterBar) return;

        const cats = getAllCategories();
        filterBar.innerHTML = `
            <span class="filter-bar-label">กรอง:</span>
            <button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                ทั้งหมด
                <span class="filter-count" id="filterCountAll">${passwords.length}</span>
            </button>
            ${cats.map(c => `
                <button class="filter-btn ${activeFilter === c.id ? 'active' : ''}" data-filter="${c.id}" style="--cat-color: ${c.color}">
                    ${ICON_PRESETS[c.icon] ? ICON_PRESETS[c.icon].replace('width="20"', 'width="13"').replace('height="20"', 'height="13"') : ''}
                    ${c.label}
                </button>
            `).join('')}
            <button class="filter-btn btn-manage-cats" id="btnManageCats" title="จัดการหมวดหมู่">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
        `;
    }

    // ===== DYNAMIC MODAL CATEGORY SELECTOR =====
    function renderCategorySelector() {
        if (!categorySelector) return;
        const cats = getAllCategories();
        categorySelector.innerHTML = cats.map(c => `
            <button type="button" class="cat-btn ${selectedCategory === c.id ? 'active' : ''}" data-cat="${c.id}" style="--cat-color: ${c.color}">
                ${ICON_PRESETS[c.icon] ? ICON_PRESETS[c.icon].replace('width="20"', 'width="14"').replace('height="20"', 'height="14"') : ''}
                ${c.label}
            </button>
        `).join('');
    }

    // ===== CATEGORY MANAGER MODAL =====
    const catManagerOverlay = document.getElementById('catManagerOverlay');

    function openCatManager() {
        renderCatManagerList();
        catManagerOverlay.classList.add('active');
    }

    function closeCatManager() {
        catManagerOverlay.classList.remove('active');
    }

    function renderCatManagerList() {
        const listEl = document.getElementById('catManagerList');
        if (!listEl) return;

        const cats = getAllCategories();
        listEl.innerHTML = cats.map(c => `
            <div class="cat-manager-item" data-cat-id="${c.id}">
                <div class="cat-manager-icon" style="color: ${c.color}">${ICON_PRESETS[c.icon] || ICON_PRESETS.folder}</div>
                <span class="cat-manager-label">${c.label}</span>
                <div class="cat-manager-color" style="background: ${c.color}"></div>
                ${c.isDefault ? '<span class="cat-manager-badge">ค่าเริ่มต้น</span>' : `
                    <button class="btn-icon cat-edit-btn" data-edit-cat="${c.id}" title="แก้ไข">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon delete cat-delete-btn" data-delete-cat="${c.id}" title="ลบ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                `}
            </div>
        `).join('');
    }

    function renderIconPicker(selectedIcon = 'folder') {
        return Object.keys(ICON_PRESETS).map(key =>
            `<button type="button" class="icon-pick-btn ${key === selectedIcon ? 'active' : ''}" data-icon="${key}" title="${ICON_LABELS[key] || key}">
                ${ICON_PRESETS[key]}
            </button>`
        ).join('');
    }

    function renderColorPicker(selectedColor = '#fb923c') {
        return COLOR_PRESETS.map(c =>
            `<button type="button" class="color-pick-btn ${c === selectedColor ? 'active' : ''}" data-color="${c}" style="background: ${c}"></button>`
        ).join('');
    }

    function renderAddCategoryForm(editCat = null) {
        const formEl = document.getElementById('catAddForm');
        if (!formEl) return;

        const label = editCat ? editCat.label : '';
        const icon = editCat ? editCat.icon : 'folder';
        const color = editCat ? editCat.color : '#81ecff';

        formEl.innerHTML = `
            <input type="hidden" id="catFormEditId" value="${editCat ? editCat.id : ''}">
            <div class="form-group">
                <label>ชื่อหมวดหมู่</label>
                <input type="text" id="catFormName" placeholder="เช่น Gaming, Social..." value="${label}" required>
            </div>
            <div class="form-group">
                <label>เลือกไอคอน</label>
                <div class="icon-picker" id="iconPicker">${renderIconPicker(icon)}</div>
                <input type="hidden" id="catFormIcon" value="${icon}">
            </div>
            <div class="form-group">
                <label>เลือกสี</label>
                <div class="color-picker" id="colorPicker">${renderColorPicker(color)}</div>
                <input type="hidden" id="catFormColor" value="${color}">
            </div>
            <button type="button" class="btn-save" id="btnSaveCat" style="width:100%;margin-top:8px">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                ${editCat ? 'อัปเดต' : 'เพิ่มหมวดหมู่'}
            </button>
        `;

        // Icon picker events
        formEl.querySelector('#iconPicker').addEventListener('click', e => {
            const btn = e.target.closest('.icon-pick-btn');
            if (!btn) return;
            formEl.querySelectorAll('.icon-pick-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            formEl.querySelector('#catFormIcon').value = btn.dataset.icon;
        });

        // Color picker events
        formEl.querySelector('#colorPicker').addEventListener('click', e => {
            const btn = e.target.closest('.color-pick-btn');
            if (!btn) return;
            formEl.querySelectorAll('.color-pick-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            formEl.querySelector('#catFormColor').value = btn.dataset.color;
        });

        // Save
        formEl.querySelector('#btnSaveCat').addEventListener('click', () => {
            const name = formEl.querySelector('#catFormName').value.trim();
            const iconVal = formEl.querySelector('#catFormIcon').value;
            const colorVal = formEl.querySelector('#catFormColor').value;
            const editId = formEl.querySelector('#catFormEditId').value;

            if (!name) { showToast('กรุณาใส่ชื่อหมวดหมู่'); return; }

            if (editId) {
                // Edit existing
                const idx = customCategories.findIndex(c => c.id === editId);
                if (idx !== -1) {
                    customCategories[idx].label = name;
                    customCategories[idx].icon = iconVal;
                    customCategories[idx].color = colorVal;
                }
            } else {
                // Add new
                const newCat = {
                    id: 'cat_' + Date.now(),
                    label: name,
                    icon: iconVal,
                    color: colorVal,
                    isDefault: false
                };
                customCategories.push(newCat);
            }

            saveCategories();
            renderCatManagerList();
            renderAddCategoryForm(); // Reset form
            renderFilterBar();
            renderCategorySelector();
            render(searchInput.value);
            renderDashboard(searchInput.value);
            showToast(editId ? 'แก้ไขหมวดหมู่แล้ว' : 'เพิ่มหมวดหมู่ใหม่แล้ว');
            closeCatManager();
        });
    }

    // ===== Cat Manager event delegation =====
    if (catManagerOverlay) {
        catManagerOverlay.addEventListener('click', e => {
            if (e.target === catManagerOverlay) closeCatManager();

            // Close button
            if (e.target.closest('#btnCloseCatManager')) closeCatManager();

            // Edit
            const editBtn = e.target.closest('.cat-edit-btn');
            if (editBtn) {
                const catId = editBtn.dataset.editCat;
                const cat = customCategories.find(c => c.id === catId);
                if (cat) renderAddCategoryForm(cat);
            }

            // Delete — open styled confirm modal
            const deleteBtn = e.target.closest('.cat-delete-btn');
            if (deleteBtn) {
                const catId = deleteBtn.dataset.deleteCat;
                const cat = customCategories.find(c => c.id === catId);
                catDeleteTargetId = catId;
                document.getElementById('catDeleteName').textContent = `ลบ "${cat ? cat.label : ''}" ใช่หรือไม่?`;
                document.getElementById('catDeleteOverlay').classList.add('active');
            }
        });
    }

    // Category delete confirmation modal handlers
    let catDeleteTargetId = null;
    const catDeleteOverlay = document.getElementById('catDeleteOverlay');

    if (catDeleteOverlay) {
        document.getElementById('btnCancelCatDelete').addEventListener('click', () => {
            catDeleteOverlay.classList.remove('active');
            catDeleteTargetId = null;
        });

        catDeleteOverlay.addEventListener('click', e => {
            if (e.target === catDeleteOverlay) {
                catDeleteOverlay.classList.remove('active');
                catDeleteTargetId = null;
            }
        });

        document.getElementById('btnConfirmCatDelete').addEventListener('click', () => {
            if (!catDeleteTargetId) return;

            // Move passwords with this category → "other"
            passwords.forEach(p => {
                if (p.category === catDeleteTargetId) p.category = 'other';
            });
            savePasswords();

            customCategories = customCategories.filter(c => c.id !== catDeleteTargetId);
            saveCategories();
            renderCatManagerList();
            renderFilterBar();
            renderCategorySelector();
            render(searchInput.value);
            renderDashboard(searchInput.value);
            showToast('ลบหมวดหมู่แล้ว');

            catDeleteOverlay.classList.remove('active');
            catDeleteTargetId = null;
        });
    }

    // Open category manager from filter bar
    document.addEventListener('click', e => {
        if (e.target.closest('#btnManageCats')) {
            openCatManager();
            renderAddCategoryForm();
        }
    });

    // ===== BACKUP (EXPORT & IMPORT) =====
    const backupOverlay = document.getElementById('backupOverlay');

    function openBackup() {
        const statusEl = document.getElementById('importStatus');
        if (statusEl) { statusEl.className = 'import-status'; statusEl.textContent = ''; }
        backupOverlay.classList.add('active');
    }

    function closeBackup() {
        backupOverlay.classList.remove('active');
    }

    // Sidebar backup button
    const btnBackup = document.getElementById('btnBackup');
    if (btnBackup) {
        btnBackup.addEventListener('click', e => {
            e.preventDefault();
            openBackup();
        });
    }

    if (backupOverlay) {
        document.getElementById('btnCloseBackup').addEventListener('click', closeBackup);
        backupOverlay.addEventListener('click', e => { if (e.target === backupOverlay) closeBackup(); });
    }

    // --- EXPORT ---
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const backupData = {
                _meta: {
                    app: 'AEGIS Vault',
                    version: '1.0',
                    exportedAt: new Date().toISOString(),
                    passwordCount: passwords.length,
                    urlCount: urlEntries.length,
                    categoryCount: customCategories.length
                },
                passwords: passwords,
                urls: urlEntries,
                categories: customCategories
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `aegis-vault-backup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast(`ส่งออกสำเร็จ — ${passwords.length} รหัสผ่าน, ${urlEntries.length} URLs`);
        });
    }

    // --- IMPORT ---
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) {
        importFileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const statusEl = document.getElementById('importStatus');

            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);

                    // Validate
                    if (!data._meta || !data._meta.app || data._meta.app !== 'AEGIS Vault') {
                        statusEl.className = 'import-status error';
                        statusEl.textContent = '❌ ไฟล์ไม่ถูกต้อง — ไม่ใช่ไฟล์สำรองของ AEGIS Vault';
                        return;
                    }

                    const mode = document.querySelector('input[name="importMode"]:checked').value;
                    const importedPw = Array.isArray(data.passwords) ? data.passwords : [];
                    const importedUrls = Array.isArray(data.urls) ? data.urls : [];
                    const importedCats = Array.isArray(data.categories) ? data.categories : [];

                    if (mode === 'replace') {
                        passwords = importedPw;
                        urlEntries = importedUrls;
                        customCategories = importedCats;
                    } else {
                        // Merge — add only items with new IDs
                        const existingPwIds = new Set(passwords.map(p => p.id));
                        const existingUrlIds = new Set(urlEntries.map(u => u.id));
                        const existingCatIds = new Set(customCategories.map(c => c.id));

                        importedPw.forEach(p => { if (!existingPwIds.has(p.id)) passwords.push(p); });
                        importedUrls.forEach(u => { if (!existingUrlIds.has(u.id)) urlEntries.push(u); });
                        importedCats.forEach(c => { if (!existingCatIds.has(c.id)) customCategories.push(c); });
                    }

                    savePasswords();
                    saveUrls();
                    saveCategories();
                    renderFilterBar();
                    renderCategorySelector();
                    render(searchInput.value);
                    renderUrls(searchInput.value);
                    renderDashboard(searchInput.value);

                    const summary = `✅ นำเข้าสำเร็จ (${mode === 'replace' ? 'แทนที่' : 'รวม'}) — ${importedPw.length} รหัสผ่าน, ${importedUrls.length} URLs, ${importedCats.length} หมวดหมู่`;
                    statusEl.className = 'import-status success';
                    statusEl.textContent = summary;
                    showToast('นำเข้าข้อมูลสำเร็จ!');
                } catch (err) {
                    statusEl.className = 'import-status error';
                    statusEl.textContent = '❌ ไม่สามารถอ่านไฟล์ได้ — รูปแบบ JSON ไม่ถูกต้อง';
                }
            };
            reader.readAsText(file);
            importFileInput.value = ''; // Reset for re-upload
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (backupOverlay && backupOverlay.classList.contains('active')) {
                closeBackup();
            } else if (catDeleteOverlay && catDeleteOverlay.classList.contains('active')) {
                catDeleteOverlay.classList.remove('active');
                catDeleteTargetId = null;
            } else if (catManagerOverlay && catManagerOverlay.classList.contains('active')) {
                closeCatManager();
            } else if (deleteModalOverlay.classList.contains('active')) {
                closeDeleteModal();
            } else if (urlModalOverlay.classList.contains('active')) {
                closeUrlModal();
            } else if (modalOverlay.classList.contains('active')) {
                closeModal();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (currentView === 'urls') openUrlModal();
            else openModal();
        }
    });

    // ===== Init =====
    loadCategories();
    loadPasswords();
    loadUrls();
    renderFilterBar();
    renderCategorySelector();
    render();
    renderUrls();
    renderDashboard();

})();


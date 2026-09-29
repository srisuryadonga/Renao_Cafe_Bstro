document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Toast Notification System
  // ==========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, icon = 'fa-solid fa-check') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<i class="${icon}" style="color: var(--amber-gold);"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3200);
  }

  // ==========================================================================
  // 2. Dynamic Theme Switcher (4 Curated Aesthetics)
  // ==========================================================================
  const themePickerWrap = document.getElementById('theme-picker-wrap');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const activeThemeLabel = document.getElementById('active-theme-label');
  const activeThemeSwatch = document.getElementById('active-theme-swatch');
  const themeOptionBtns = document.querySelectorAll('.theme-option-btn');

  const themeMeta = {
    noir: { name: 'Amber Noir', swatch: '#df9d50', toast: 'Switched to Dark Amber Noir theme' },
    alabaster: { name: 'Warm Alabaster', swatch: '#a4622b', toast: 'Switched to Warm Alabaster Daylight theme' },
    emerald: { name: 'Emerald Noir', swatch: '#10b981', toast: 'Switched to Emerald Noir Botanical theme' },
    burgundy: { name: 'Velvet Burgundy', swatch: '#e59a84', toast: 'Switched to Velvet Burgundy & Rose Gold theme' }
  };

  function applyTheme(themeKey, notify = false) {
    if (!themeMeta[themeKey]) themeKey = 'noir';
    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('renao_theme', themeKey);

    if (activeThemeLabel) activeThemeLabel.textContent = themeMeta[themeKey].name;
    if (activeThemeSwatch) {
      activeThemeSwatch.style.backgroundColor = themeMeta[themeKey].swatch;
      activeThemeSwatch.style.boxShadow = `0 0 8px ${themeMeta[themeKey].swatch}`;
    }

    themeOptionBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-val') === themeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (notify) {
      showToast(themeMeta[themeKey].toast, 'fa-solid fa-palette');
    }
  }

  // Load saved theme or default
  const savedTheme = localStorage.getItem('renao_theme') || 'noir';
  applyTheme(savedTheme, false);

  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = themeDropdown.classList.contains('open');
      if (isOpen) {
        themeDropdown.classList.remove('open');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        themeDropdown.classList.add('open');
        themeToggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    themeOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTheme = btn.getAttribute('data-theme-val');
        applyTheme(selectedTheme, true);
        themeDropdown.classList.remove('open');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!themePickerWrap.contains(e.target)) {
        themeDropdown.classList.remove('open');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================================================
  // 3. Mobile Navigation Toggle
  // ==========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // ==========================================================================
  // 4. Interactive Table Ordering Tray & Bill Preview System
  // ==========================================================================
  let orderTray = [];
  try {
    const savedTray = localStorage.getItem('renao_tray');
    if (savedTray) orderTray = JSON.parse(savedTray);
  } catch (err) {
    orderTray = [];
  }

  let currentTip = 0;

  const floatingTrayBar = document.getElementById('floating-tray-bar');
  const trayBarCount = document.getElementById('tray-bar-count');
  const trayBarPrice = document.getElementById('tray-bar-price');
  const openTrayDrawerBtn = document.getElementById('open-tray-drawer-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const trayItemsList = document.getElementById('tray-items-list');
  const kitchenNotesWrap = document.getElementById('kitchen-notes-wrap');
  const tipSelectorGroup = document.getElementById('tip-selector-group');
  const billBreakdownCard = document.getElementById('bill-breakdown-card');
  const drawerFooter = document.getElementById('drawer-footer');
  const billSubtotal = document.getElementById('bill-subtotal');
  const billTax = document.getElementById('bill-tax');
  const billTip = document.getElementById('bill-tip');
  const billGrandTotal = document.getElementById('bill-grand-total');
  const tipBtns = document.querySelectorAll('.tip-btn');
  const sendWhatsappOrderBtn = document.getElementById('send-whatsapp-order-btn');
  const copyBillBtn = document.getElementById('copy-bill-btn');
  const clearTrayBtn = document.getElementById('clear-tray-btn');
  const orderTableSelect = document.getElementById('order-table-select');
  const kitchenNotesInput = document.getElementById('kitchen-notes');

  function saveTray() {
    localStorage.setItem('renao_tray', JSON.stringify(orderTray));
    updateTrayUI();
  }

  function getTrayCount() {
    return orderTray.reduce((acc, item) => acc + item.qty, 0);
  }

  function getTraySubtotal() {
    return orderTray.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }

  function updateItemButtonsInMenu() {
    // Update all buttons with matching data-add-id
    document.querySelectorAll('.btn-add-tray').forEach(btn => {
      const id = btn.getAttribute('data-add-id');
      const inTray = orderTray.find(item => item.id === id);
      if (inTray && inTray.qty > 0) {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> IN TRAY (${inTray.qty})`;
        btn.style.backgroundColor = 'var(--amber-gold)';
        btn.style.color = 'var(--btn-primary-text)';
      } else {
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> ADD`;
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }
    });
  }

  function updateTrayUI() {
    const totalCount = getTrayCount();
    const subtotal = getTraySubtotal();

    // Floating bar visibility
    if (floatingTrayBar) {
      if (totalCount > 0) {
        floatingTrayBar.style.display = 'block';
        if (trayBarCount) trayBarCount.textContent = `${totalCount} ${totalCount === 1 ? 'ITEM' : 'ITEMS'}`;
        if (trayBarPrice) trayBarPrice.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      } else {
        floatingTrayBar.style.display = 'none';
      }
    }

    // Drawer items list
    if (trayItemsList) {
      if (orderTray.length === 0) {
        trayItemsList.innerHTML = `
          <div class="tray-empty-placeholder">
            <i class="fa-solid fa-bag-shopping"></i>
            <p>Your order tray is currently empty.</p>
            <span style="font-size: 0.75rem; color: var(--sepia-label);">Tap "+ ADD" on any dish or signature above to begin your feast.</span>
          </div>
        `;
        if (kitchenNotesWrap) kitchenNotesWrap.style.display = 'none';
        if (tipSelectorGroup) tipSelectorGroup.style.display = 'none';
        if (billBreakdownCard) billBreakdownCard.style.display = 'none';
        if (drawerFooter) drawerFooter.style.display = 'none';
      } else {
        if (kitchenNotesWrap) kitchenNotesWrap.style.display = 'block';
        if (tipSelectorGroup) tipSelectorGroup.style.display = 'block';
        if (billBreakdownCard) billBreakdownCard.style.display = 'flex';
        if (drawerFooter) drawerFooter.style.display = 'flex';

        trayItemsList.innerHTML = orderTray.map(item => `
          <div class="tray-item-row" data-tray-row-id="${item.id}">
            <div class="tray-item-info">
              <span class="tray-item-name">${item.name}</span>
              <span class="tray-item-rate">₹${item.price} each</span>
            </div>
            <div class="tray-item-right">
              <div class="qty-counter-control">
                <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
              <span class="tray-item-subtotal">₹${item.price * item.qty}</span>
              <button class="tray-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove item" title="Remove">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('');

        // Attach listeners for +, -, remove inside drawer
        trayItemsList.querySelectorAll('.qty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            const item = orderTray.find(i => i.id === id);
            if (!item) return;

            if (action === 'increase') {
              item.qty += 1;
            } else if (action === 'decrease') {
              item.qty -= 1;
              if (item.qty <= 0) {
                orderTray = orderTray.filter(i => i.id !== id);
              }
            }
            saveTray();
          });
        });

        trayItemsList.querySelectorAll('.tray-remove-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = orderTray.find(i => i.id === id);
            if (item) {
              orderTray = orderTray.filter(i => i.id !== id);
              saveTray();
              showToast(`Removed ${item.name} from tray`, 'fa-regular fa-trash-can');
            }
          });
        });

        // Calculate Bill
        const tax = Math.round(subtotal * 0.05); // 5% GST & service
        const grandTotal = subtotal + tax + currentTip;

        if (billSubtotal) billSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (billTax) billTax.textContent = `₹${tax.toLocaleString('en-IN')}`;
        if (billTip) billTip.textContent = `₹${currentTip.toLocaleString('en-IN')}`;
        if (billGrandTotal) billGrandTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
      }
    }

    updateItemButtonsInMenu();
  }

  // Handle Add to Tray button clicks across both Signatures and Categorized Menu
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add-tray');
    if (!addBtn) return;

    const id = addBtn.getAttribute('data-add-id');
    const name = addBtn.getAttribute('data-name');
    const price = parseInt(addBtn.getAttribute('data-price'), 10) || 0;
    const diet = addBtn.getAttribute('data-diet') || 'veg';

    const existing = orderTray.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
      showToast(`Added another ${name} (Qty: ${existing.qty})`, 'fa-solid fa-circle-check');
    } else {
      orderTray.push({ id, name, price, diet, qty: 1 });
      showToast(`Added ${name} (₹${price}) to Table Tray`, 'fa-solid fa-bell-concierge');
    }

    saveTray();
  });

  // Open & Close Drawer
  function openDrawer() {
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openTrayDrawerBtn) openTrayDrawerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) closeDrawer();
    });
  }

  // Tip Selector
  tipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTip = parseInt(btn.getAttribute('data-tip'), 10) || 0;
      updateTrayUI();
    });
  });

  // Clear Tray
  if (clearTrayBtn) {
    clearTrayBtn.addEventListener('click', () => {
      if (orderTray.length === 0) return;
      if (confirm('Are you sure you want to clear your table tray?')) {
        orderTray = [];
        currentTip = 0;
        tipBtns.forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
        saveTray();
        showToast('Table tray cleared', 'fa-regular fa-trash-can');
      }
    });
  }

  // Generate Formatted Order Text
  function generateOrderSummaryText() {
    const table = orderTableSelect ? orderTableSelect.value : 'Table';
    const notes = kitchenNotesInput ? kitchenNotesInput.value.trim() : '';
    const subtotal = getTraySubtotal();
    const tax = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + tax + currentTip;

    let text = `*Rénao — Café | Bistro*\n`;
    text += `*Service:* ${table}\n`;
    text += `*Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `──────────────────\n`;
    orderTray.forEach(item => {
      text += `• ${item.qty}x ${item.name} — ₹${item.price * item.qty}\n`;
    });
    text += `──────────────────\n`;
    text += `Subtotal: ₹${subtotal}\n`;
    text += `GST & Service (5%): ₹${tax}\n`;
    if (currentTip > 0) text += `Staff Tip: ₹${currentTip}\n`;
    text += `*Grand Total: ₹${grandTotal}*\n`;
    if (notes) text += `\n*Kitchen Notes:* ${notes}\n`;
    text += `\nPlease confirm and prepare our order!`;
    return text;
  }

  // WhatsApp Order Submission
  if (sendWhatsappOrderBtn) {
    sendWhatsappOrderBtn.addEventListener('click', () => {
      if (orderTray.length === 0) return;
      const text = generateOrderSummaryText();
      const phone = '919908999643';
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      showToast('Opening WhatsApp with your table order...', 'fa-brands fa-whatsapp');
    });
  }

  // Copy Bill Summary
  if (copyBillBtn) {
    copyBillBtn.addEventListener('click', () => {
      if (orderTray.length === 0) return;
      const text = generateOrderSummaryText();
      navigator.clipboard.writeText(text).then(() => {
        showToast('Bill summary copied to clipboard!', 'fa-regular fa-copy');
      }).catch(() => {
        showToast('Unable to copy to clipboard', 'fa-solid fa-triangle-exclamation');
      });
    });
  }

  // Initial update
  updateTrayUI();

  // ==========================================================================
  // 5. Menu Search, Dietary Filters & Sorting
  // ==========================================================================
  const searchInput = document.getElementById('menu-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const dietPills = document.querySelectorAll('.diet-pill');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const categoryBlocks = document.querySelectorAll('.menu-category-block');
  const sortSelect = document.getElementById('menu-sort-select');
  const resultsCount = document.getElementById('menu-results-count');
  const emptyState = document.getElementById('menu-empty-state');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');

  let activeTab = 'all';
  let activeDiet = 'all';
  let searchQuery = '';

  function filterMenu() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    // Check search clear button visibility
    if (searchClearBtn) {
      searchClearBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    categoryBlocks.forEach(block => {
      const blockCategory = block.getAttribute('data-category');
      const rows = block.querySelectorAll('.menu-item-row');
      let blockVisibleCount = 0;

      rows.forEach(row => {
        const name = (row.getAttribute('data-name') || '').toLowerCase();
        const category = (row.getAttribute('data-category') || '').toLowerCase();
        const diet = (row.getAttribute('data-diet') || '').toLowerCase();
        const isSpecial = row.getAttribute('data-special') === 'true';
        const subtext = (row.querySelector('.item-subtext')?.textContent || '').toLowerCase();

        // 1. Tab condition
        const tabMatch = (activeTab === 'all') || (blockCategory === activeTab);

        // 2. Dietary condition
        let dietMatch = true;
        if (activeDiet === 'veg') dietMatch = (diet === 'veg');
        else if (activeDiet === 'nonveg') dietMatch = (diet === 'nonveg');
        else if (activeDiet === 'special') dietMatch = isSpecial;
        else if (activeDiet === 'desserts') dietMatch = (category === 'desserts' || blockCategory === 'desserts');

        // 3. Search query condition
        let searchMatch = true;
        if (query.length > 0) {
          searchMatch = name.includes(query) || subtext.includes(query) || category.includes(query);
        }

        if (tabMatch && dietMatch && searchMatch) {
          row.style.display = 'flex';
          blockVisibleCount++;
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      // Show/hide category block based on visible rows and tab
      if (blockVisibleCount > 0 && (activeTab === 'all' || blockCategory === activeTab)) {
        block.style.display = 'block';
      } else {
        block.style.display = 'none';
      }
    });

    // Update match count
    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'dish' : 'dishes'}`;
    }

    // Empty state
    if (emptyState) {
      emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterMenu();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchInput.focus();
        filterMenu();
      }
    });
  }

  // Dietary Pill buttons
  dietPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dietPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDiet = pill.getAttribute('data-diet-filter');
      filterMenu();
    });
  });

  // Category Tab buttons
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      filterMenu();
    });
  });

  // Price sorting
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const sortVal = sortSelect.value;
      if (sortVal === 'default') {
        filterMenu();
        return;
      }

      categoryBlocks.forEach(block => {
        const list = block.querySelector('.menu-items-list');
        if (!list) return;
        const rows = Array.from(list.querySelectorAll('.menu-item-row'));
        rows.sort((a, b) => {
          const priceA = parseInt(a.getAttribute('data-price'), 10) || 0;
          const priceB = parseInt(b.getAttribute('data-price'), 10) || 0;
          return sortVal === 'price-low' ? priceA - priceB : priceB - priceA;
        });
        rows.forEach(r => list.appendChild(r));
      });
      filterMenu();
    });
  }

  // Reset filters button in empty state
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      activeTab = 'all';
      activeDiet = 'all';

      tabBtns.forEach(b => b.classList.remove('active'));
      tabBtns[0]?.classList.add('active');

      dietPills.forEach(p => p.classList.remove('active'));
      dietPills[0]?.classList.add('active');

      if (sortSelect) sortSelect.value = 'default';

      filterMenu();
      showToast('Filters reset', 'fa-solid fa-rotate-left');
    });
  }

  // ==========================================================================
  // 6. Enhanced Reservation Modal & Digital Pass Generation
  // ==========================================================================
  const reservationModal = document.getElementById('reservation-modal');
  const openModalBtn = document.getElementById('open-modal-btn');
  const heroReserveBtn = document.getElementById('hero-reserve-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');

  // Digital Pass Elements
  const passCodeVal = document.getElementById('pass-code-val');
  const passGuestName = document.getElementById('pass-guest-name');
  const passGuestCount = document.getElementById('pass-guest-count');
  const passDateTime = document.getElementById('pass-date-time');
  const passSeatingZone = document.getElementById('pass-seating-zone');
  const passWhatsappBtn = document.getElementById('pass-whatsapp-btn');

  // Set min date to today
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }

  // Seating radio card selection style toggle
  const seatingRadioLabels = document.querySelectorAll('.seating-radio-label');
  seatingRadioLabels.forEach(label => {
    label.addEventListener('click', () => {
      seatingRadioLabels.forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });

  function openReservationModal() {
    if (reservationModal) {
      reservationModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeReservationModal() {
    if (reservationModal) {
      reservationModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (bookingForm && bookingSuccess) {
          bookingForm.style.display = 'flex';
          bookingSuccess.style.display = 'none';
          bookingForm.reset();
          if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
          // Reset seating radio selection
          seatingRadioLabels.forEach((l, idx) => {
            if (idx === 0) l.classList.add('selected');
            else l.classList.remove('selected');
          });
        }
      }, 400);
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openReservationModal);
  if (heroReserveBtn) heroReserveBtn.addEventListener('click', openReservationModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeReservationModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeReservationModal);

  if (reservationModal) {
    reservationModal.addEventListener('click', (e) => {
      if (e.target === reservationModal) closeReservationModal();
    });
  }

  // Handle Booking Form Submission & Generate Digital Pass
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('guest-name')?.value || 'Guest';
      const phone = document.getElementById('guest-phone')?.value || '099089 99643';
      const guests = document.getElementById('guest-count')?.value || '4';
      const dateVal = document.getElementById('booking-date')?.value || new Date().toISOString().split('T')[0];
      const timeVal = document.getElementById('booking-time')?.value || '08:30 PM';
      const occasion = document.getElementById('booking-occasion')?.value || 'Casual Dining';
      const special = document.getElementById('booking-special')?.value || '';

      const selectedSeatingRadio = document.querySelector('input[name="seating-zone"]:checked');
      const seatingZone = selectedSeatingRadio ? selectedSeatingRadio.value : 'Filament Corner Booth';

      // Generate random luxury pass code
      const randomCode = '#RNO-' + Math.floor(1000 + Math.random() * 9000);

      // Populate Digital Pass Card
      if (passCodeVal) passCodeVal.textContent = randomCode;
      if (passGuestName) passGuestName.textContent = name;
      if (passGuestCount) passGuestCount.textContent = `${guests} Guests (${occasion})`;
      if (passDateTime) passDateTime.textContent = `${dateVal} · ${timeVal}`;
      if (passSeatingZone) passSeatingZone.textContent = seatingZone;

      // WhatsApp confirmation link
      if (passWhatsappBtn) {
        let msg = `*Rénao Table Reservation Pass ${randomCode}*\n`;
        msg += `*Guest:* ${name}\n`;
        msg += `*Phone:* ${phone}\n`;
        msg += `*Party:* ${guests} Guests\n`;
        msg += `*Date & Time:* ${dateVal} · ${timeVal}\n`;
        msg += `*Seating Preference:* ${seatingZone}\n`;
        msg += `*Occasion:* ${occasion}\n`;
        if (special) msg += `*Special Request:* ${special}\n`;
        msg += `\nPlease confirm our reservation!`;

        passWhatsappBtn.href = `https://wa.me/919908999643?text=${encodeURIComponent(msg)}`;
      }

      // Hide form & reveal pass
      bookingForm.style.display = 'none';
      if (bookingSuccess) bookingSuccess.style.display = 'block';

      showToast(`Reservation Pass ${randomCode} created!`, 'fa-solid fa-ticket');
    });
  }

  // ==========================================================================
  // 7. Testimonials Auto-Rotation
  // ==========================================================================
  const testimonials = document.querySelectorAll('.testimonial-card');
  let currentQuote = 0;

  if (testimonials.length > 1) {
    setInterval(() => {
      testimonials.forEach((card, idx) => {
        if (idx === currentQuote) {
          card.classList.add('active-quote');
        } else {
          card.classList.remove('active-quote');
        }
      });
      currentQuote = (currentQuote + 1) % testimonials.length;
    }, 6000);
  }

  // ==========================================================================
  // 8. Navbar Sticky Scroll
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

});

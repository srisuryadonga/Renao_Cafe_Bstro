document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Navigation Toggle
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

  // 2. Menu Category Tabs Filtering
  const tabBtns = document.querySelectorAll('.tab-btn');
  const categoryBlocks = document.querySelectorAll('.menu-category-block');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedTab = btn.getAttribute('data-tab');

      categoryBlocks.forEach(block => {
        if (selectedTab === 'all') {
          block.style.display = 'block';
        } else {
          const category = block.getAttribute('data-category');
          if (category === selectedTab) {
            block.style.display = 'block';
          } else {
            block.style.display = 'none';
          }
        }
      });
    });
  });

  // 3. Reservation Modal Logic
  const reservationModal = document.getElementById('reservation-modal');
  const openModalBtn = document.getElementById('open-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');

  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }

  function openModal() {
    if (reservationModal) {
      reservationModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (reservationModal) {
      reservationModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (bookingForm && bookingSuccess) {
          bookingForm.style.display = 'flex';
          bookingSuccess.style.display = 'none';
          bookingForm.reset();
          if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        }
      }, 400);
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

  if (reservationModal) {
    reservationModal.addEventListener('click', (e) => {
      if (e.target === reservationModal) closeModal();
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookingForm.style.display = 'none';
      if (bookingSuccess) bookingSuccess.style.display = 'block';
    });
  }

  // 4. Testimonials Rotation
  const testimonials = document.querySelectorAll('.testimonial-card');
  let currentQuote = 0;

  if (testimonials.length > 1) {
    setInterval(() => {
      testimonials.forEach((card, idx) => {
        if (idx === currentQuote) {
          card.classList.add('active-quote');
          card.style.borderColor = 'var(--amber-gold)';
        } else {
          card.classList.remove('active-quote');
          card.style.borderColor = 'var(--border-subtle)';
        }
      });
      currentQuote = (currentQuote + 1) % testimonials.length;
    }, 5000);
  }

  // 5. Navbar Sticky Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.style.backgroundColor = 'rgba(10, 6, 4, 0.96)';
    } else {
      navbar.style.backgroundColor = 'rgba(14, 9, 7, 0.92)';
    }
  });

});

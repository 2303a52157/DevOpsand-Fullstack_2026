// ─── Hamburger / sidebar toggle ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('sidebarOverlay');

if (hamburger && sidebar) {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  });
}
if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// ─── Active nav link ──────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(link => {
  if (link.href && window.location.pathname.startsWith(new URL(link.href).pathname) && new URL(link.href).pathname !== '/') {
    link.classList.add('active');
  }
});

// ─── Delete confirm modal ─────────────────────────────────────────────
function openDeleteModal(formId) {
  const modal = document.getElementById('deleteModal');
  if (modal) {
    modal.dataset.formId = formId;
    modal.classList.add('active');
  }
}

function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('active');
}

document.addEventListener('click', e => {
  if (e.target.id === 'confirmDeleteBtn') {
    const formId = document.getElementById('deleteModal').dataset.formId;
    const form = document.getElementById(formId);
    if (form) form.submit();
  }
  if (e.target.id === 'cancelDeleteBtn' || e.target.classList.contains('modal-overlay')) {
    closeDeleteModal();
  }
});

// ─── Auto-hide flash messages ─────────────────────────────────────────
const alerts = document.querySelectorAll('.alert');
alerts.forEach(alert => {
  setTimeout(() => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  }, 4000);
});

// ─── Image preview on file select ────────────────────────────────────
function setupImagePreview(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

setupImagePreview('coverImageInput', 'coverPreview');
setupImagePreview('avatarInput', 'avatarPreview');

// ─── Star rating display ──────────────────────────────────────────────
function renderStars(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<span style="color:${i <= rating ? 'var(--accent)' : 'var(--border-light)'}">${i <= rating ? '★' : '☆'}</span>`;
  }
  return html;
}

document.querySelectorAll('[data-stars]').forEach(el => {
  el.innerHTML = renderStars(parseInt(el.dataset.stars));
});

// ─── Interactive star picker ──────────────────────────────────────────
const starPicker = document.getElementById('starPicker');
const ratingInput = document.getElementById('ratingInput');
if (starPicker && ratingInput) {
  const stars = starPicker.querySelectorAll('.star-btn');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      ratingInput.value = val;
      stars.forEach((s, i) => {
        s.textContent = i < val ? '★' : '☆';
        s.style.color  = i < val ? 'var(--accent)' : 'var(--border-light)';
      });
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s, i) => {
        s.style.color = i < val ? 'var(--accent-light)' : 'var(--border-light)';
      });
    });
  });
  starPicker.addEventListener('mouseleave', () => {
    const current = parseInt(ratingInput.value) || 0;
    stars.forEach((s, i) => {
      s.style.color = i < current ? 'var(--accent)' : 'var(--border-light)';
    });
  });
}

// ─── Table search (client-side) ───────────────────────────────────────
const tableSearch = document.getElementById('tableSearch');
if (tableSearch) {
  tableSearch.addEventListener('input', () => {
    const q = tableSearch.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

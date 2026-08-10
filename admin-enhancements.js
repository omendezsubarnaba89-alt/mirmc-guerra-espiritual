(() => {
  const usersWrap = document.querySelector('#adminUsers');
  const toolbar = document.querySelector('.admin-toolbar');

  if (toolbar && !toolbar.querySelector('[data-content-link]')) {
    const link = document.createElement('a');
    link.href = 'admin-content.html';
    link.className = 'button button-primary';
    link.dataset.contentLink = 'true';
    link.textContent = 'Gestionar contenido';
    toolbar.appendChild(link);
  }

  if (toolbar && !toolbar.querySelector('[data-content-audit-link]')) {
    const link = document.createElement('a');
    link.href = 'admin-content-audit.html';
    link.className = 'button button-ghost';
    link.dataset.contentAuditLink = 'true';
    link.textContent = 'Historial editorial';
    toolbar.appendChild(link);
  }

  if (toolbar && !toolbar.querySelector('[data-audit-link]')) {
    const link = document.createElement('a');
    link.href = 'admin-audit.html';
    link.className = 'button button-ghost';
    link.dataset.auditLink = 'true';
    link.textContent = 'Bitácora de seguridad';
    toolbar.appendChild(link);
  }

  function enhanceCards() {
    if (!usersWrap) return;
    usersWrap.querySelectorAll('.admin-user[data-user-id]').forEach(card => {
      if (card.querySelector('[data-detail-link]')) return;
      const userId = card.dataset.userId;
      if (!userId) return;
      const link = document.createElement('a');
      link.href = `admin-user.html?id=${encodeURIComponent(userId)}`;
      link.className = 'button button-ghost admin-detail-link';
      link.dataset.detailLink = 'true';
      link.textContent = 'Ver expediente académico →';
      link.style.display = 'inline-flex';
      link.style.marginBottom = '14px';
      link.style.justifyContent = 'center';
      const editor = card.querySelector('.admin-role-editor');
      if (editor) card.insertBefore(link, editor);
      else card.appendChild(link);
    });
  }

  enhanceCards();
  if (usersWrap) new MutationObserver(enhanceCards).observe(usersWrap, { childList: true, subtree: true });
})();

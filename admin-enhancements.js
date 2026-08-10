(() => {
  const usersWrap = document.querySelector('#adminUsers');
  const toolbar = document.querySelector('.admin-toolbar');

  function addToolbarLink(selector, href, className, text, datasetName) {
    if (!toolbar || toolbar.querySelector(selector)) return;
    const link = document.createElement('a');
    link.href = href;
    link.className = className;
    link.dataset[datasetName] = 'true';
    link.textContent = text;
    toolbar.appendChild(link);
  }

  addToolbarLink('[data-content-link]','admin-content.html','button button-primary','Gestionar contenido','contentLink');
  addToolbarLink('[data-certificates-link]','admin-certificates.html','button button-ghost','Certificados verificables','certificatesLink');
  addToolbarLink('[data-content-audit-link]','admin-content-audit.html','button button-ghost','Historial editorial','contentAuditLink');
  addToolbarLink('[data-audit-link]','admin-audit.html','button button-ghost','Bitácora de seguridad','auditLink');

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

/**
 * 관리자 공통 유틸리티
 */
'use strict';

const API = '/api';

// ── 인증 ──
function getToken() { return localStorage.getItem('adminToken'); }
function getAdminInfo() {
  try { return JSON.parse(localStorage.getItem('adminInfo') || '{}'); } catch { return {}; }
}

function requireAuth() {
  if (!getToken()) { location.href = 'login.html'; return false; }
  const info = getAdminInfo();
  const nameEl = document.getElementById('headerAdminName');
  const sidebarName = document.getElementById('sidebarAdminName');
  const sidebarRole = document.getElementById('sidebarAdminRole');
  if (nameEl)     nameEl.textContent = info.name || '';
  if (sidebarName) sidebarName.textContent = info.name || '관리자';
  if (sidebarRole) sidebarRole.textContent = info.role === 'super_admin' ? '최고 관리자' : '관리자';
  return true;
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
  location.href = 'login.html';
});

// ── API 호출 ──
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { localStorage.clear(); location.href = 'login.html'; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.');
  return data;
}

// ── 토스트 ──
function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── 날짜 포맷 ──
function fmtDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function fmtDateTime(str) {
  if (!str) return '-';
  return new Date(str).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── 페이지네이션 렌더 ──
function renderPagination(containerId, current, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  if (totalPages <= 1) return;

  const mkBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled && !active) btn.addEventListener('click', () => onPageChange(page));
    return btn;
  };

  el.appendChild(mkBtn('◀', current - 1, current === 1));

  const start = Math.max(1, current - 2);
  const end   = Math.min(totalPages, current + 2);
  for (let i = start; i <= end; i++) {
    el.appendChild(mkBtn(String(i), i, false, i === current));
  }

  el.appendChild(mkBtn('▶', current + 1, current === totalPages));
}

// ── 모달 열기/닫기 ──
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// 초기 인증 체크
if (!document.getElementById('loginForm')) { requireAuth(); }

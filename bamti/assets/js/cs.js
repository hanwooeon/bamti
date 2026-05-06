'use strict';

let currentPage = 1;
let currentCsId = null;

const statusLabel   = { pending: '대기 중', in_progress: '처리 중', resolved: '해결 완료', closed: '종료' };

async function loadCs(page = 1) {
  currentPage = page;
  const search   = document.getElementById('searchInput').value.trim();
  const status   = document.getElementById('statusFilter').value;
  const category = document.getElementById('categoryFilter').value;

  const params = new URLSearchParams({ page, limit: 20, search, status, category });
  const tbody  = document.getElementById('csTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">불러오는 중...</td></tr>';

  try {
    const data = await apiFetch(`/cs?${params}`);
    document.getElementById('totalCount').textContent = data.total;

    if (data.inquiries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state__icon">💬</div><div class="empty-state__text">문의가 없습니다.</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = data.inquiries.map(cs => `
      <tr>
        <td><span class="badge badge-normal" style="font-size:11px;">${cs.category}</span></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${cs.title}">${cs.title}</td>
        <td>${cs.name}</td>
        <td><span class="badge badge-${cs.status}">${statusLabel[cs.status] || cs.status}</span></td>
        <td>${fmtDate(cs.created_at)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openCsDetail(${cs.id})">
            관리
          </button>
        </td>
      </tr>
    `).join('');

    renderPagination('pagination', data.page, data.totalPages, loadCs);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;text-align:center;">오류: ${err.message}</td></tr>`;
  }
}

async function openCsDetail(id) {
  currentCsId = id;
  openModal('csModal');
  document.getElementById('csDetail').innerHTML = '<div class="loading">불러오는 중...</div>';
  document.getElementById('existingReply').style.display = 'none';
  document.getElementById('replyTextarea').value = '';

  try {
    const cs = await apiFetch(`/cs/${id}`);
    document.getElementById('csModalTitle').textContent = cs.title;
    document.getElementById('csStatusSelect').value   = cs.status;

    document.getElementById('csDetail').innerHTML = `
      <div class="detail-item"><label>접수일</label><p>${fmtDateTime(cs.created_at)}</p></div>
      <div class="detail-item"><label>카테고리</label><p>${cs.category}</p></div>
      <div class="detail-item"><label>이름</label><p>${cs.name}</p></div>
      <div class="detail-item"><label>상태</label><p>${statusLabel[cs.status] || cs.status}</p></div>
    `;
  } catch (err) {
    document.getElementById('csDetail').innerHTML = `<div style="color:red;">오류: ${err.message}</div>`;
  }
}

// 저장 (상태)
document.getElementById('csSaveBtn')?.addEventListener('click', async () => {
  if (!currentCsId) return;
  const status     = document.getElementById('csStatusSelect').value;

  try {
    await apiFetch(`/cs/${currentCsId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast('저장되었습니다.', 'success');
    closeModal('csModal');
    loadCs(currentPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// 검색
document.getElementById('searchBtn')?.addEventListener('click', () => loadCs(1));
document.getElementById('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') loadCs(1); });

// 모달 닫기
document.getElementById('modalClose')?.addEventListener('click',    () => closeModal('csModal'));
document.getElementById('modalCancelBtn')?.addEventListener('click', () => closeModal('csModal'));
document.getElementById('csModal')?.addEventListener('click', e => { if (e.target.id === 'csModal') closeModal('csModal'); });

// 초기 로드
loadCs();

'use strict';

let currentPage = 1;
let currentMemberId = null;

const statusLabel = { active: '활성', suspended: '이용 정지', withdrawn: '탈퇴' };
const typeLabel   = { adult: '성인', kids: '어린이' };
const langLabel   = { '': '-', english: '영어', chinese: '중국어', japanese: '일본어', french: '프랑스어' };

async function loadMembers(page = 1) {
  currentPage = page;
  const search     = document.getElementById('searchInput').value.trim();
  const status     = document.getElementById('statusFilter').value;
  const memberType = document.getElementById('typeFilter').value;

  const params = new URLSearchParams({ page, limit: 20, search, status, memberType });
  const tbody  = document.getElementById('memberTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="loading">불러오는 중...</td></tr>';

  try {
    const data = await apiFetch(`/members?${params}`);
    document.getElementById('totalCount').textContent = data.total;

    if (data.members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__text">회원이 없습니다.</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = data.members.map(m => `
      <tr>
        <td style="color:#718096;">#${m.id}</td>
        <td><strong>${m.name}</strong>${m.is_minor ? ' <span class="badge badge-kids" style="font-size:10px;">미성년</span>' : ''}</td>
        <td>${m.email}</td>
        <td>${m.phone}</td>
        <td><span class="badge badge-${m.member_type}">${typeLabel[m.member_type] || m.member_type}</span></td>
        <td><span class="badge badge-${m.status}">${statusLabel[m.status] || m.status}</span></td>
        <td>${fmtDate(m.created_at)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openMemberDetail(${m.id})">상세</button>
        </td>
      </tr>
    `).join('');

    renderPagination('pagination', data.page, data.totalPages, loadMembers);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:red;text-align:center;">오류: ${err.message}</td></tr>`;
  }
}

async function openMemberDetail(id) {
  currentMemberId = id;
  openModal('memberModal');
  document.getElementById('memberDetail').innerHTML = '<div class="loading">불러오는 중...</div>';

  try {
    const m = await apiFetch(`/members/${id}`);
    document.getElementById('statusSelect').value = m.status;

    document.getElementById('memberDetail').innerHTML = `
      <div class="detail-item"><label>ID</label><p>#${m.id}</p></div>
      <div class="detail-item"><label>가입일</label><p>${fmtDateTime(m.created_at)}</p></div>
      <div class="detail-item"><label>이름</label><p>${m.name}</p></div>
      <div class="detail-item"><label>유형</label><p><span class="badge badge-${m.member_type}">${typeLabel[m.member_type]}</span></p></div>
      <div class="detail-item"><label>이메일</label><p>${m.email}</p></div>
      <div class="detail-item"><label>전화번호</label><p>${m.phone}</p></div>
      <div class="detail-item"><label>생년월일</label><p>${fmtDate(m.birth_date)}</p></div>
      <div class="detail-item"><label>관심 언어</label><p>${langLabel[m.interest_lang] || m.interest_lang || '-'}</p></div>
      <div class="detail-item"><label>상태</label><p><span class="badge badge-${m.status}">${statusLabel[m.status]}</span></p></div>
      <div class="detail-item"><label>미성년자</label><p>${m.is_minor ? '예' : '아니오'}</p></div>
      ${m.is_minor ? `
      <div class="detail-divider"></div>
      <div class="detail-item full"><label>법정대리인 정보</label></div>
      <div class="detail-item"><label>대리인 이름</label><p>${m.guardian_name || '-'}</p></div>
      <div class="detail-item"><label>관계</label><p>${m.guardian_relation || '-'}</p></div>
      <div class="detail-item"><label>대리인 전화</label><p>${m.guardian_phone || '-'}</p></div>
      <div class="detail-item"><label>대리인 이메일</label><p>${m.guardian_email || '-'}</p></div>
      ` : ''}
      <div class="detail-divider"></div>
      <div class="detail-item full"><label>동의 내역</label></div>
      <div class="detail-item"><label>이용약관</label><p>${m.consent_terms ? '✅ 동의' : '❌ 미동의'}</p></div>
      <div class="detail-item"><label>개인정보(서비스)</label><p>${m.consent_privacy_service ? '✅ 동의' : '❌ 미동의'}</p></div>
      <div class="detail-item"><label>개인정보(결제)</label><p>${m.consent_privacy_payment ? '✅ 동의' : '❌ 미동의'}</p></div>
      <div class="detail-item"><label>제3자 제공</label><p>${m.consent_third_party ? '✅ 동의' : '❌ 미동의'}</p></div>
      <div class="detail-item"><label>마케팅</label><p>${m.consent_marketing ? '✅ 동의' : '❌ 미동의'}</p></div>
      <div class="detail-item"><label>광고 수신</label><p>${m.consent_ad_receive ? '✅ 동의' : '❌ 미동의'}</p></div>
      ${m.memo ? `<div class="detail-item full"><label>메모</label><p>${m.memo}</p></div>` : ''}
      ${m.withdrawn_at ? `<div class="detail-item"><label>탈퇴일</label><p>${fmtDateTime(m.withdrawn_at)}</p></div>` : ''}
    `;
  } catch (err) {
    document.getElementById('memberDetail').innerHTML = `<div style="color:red;">오류: ${err.message}</div>`;
  }
}

// 상태 변경 저장
document.getElementById('statusSaveBtn')?.addEventListener('click', async () => {
  if (!currentMemberId) return;
  const status = document.getElementById('statusSelect').value;
  try {
    await apiFetch(`/members/${currentMemberId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast('상태가 변경되었습니다.', 'success');
    closeModal('memberModal');
    loadMembers(currentPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// 회원 삭제
document.getElementById('deleteMemberBtn')?.addEventListener('click', async () => {
  if (!currentMemberId) return;
  if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  try {
    await apiFetch(`/members/${currentMemberId}`, { method: 'DELETE' });
    showToast('삭제되었습니다.', 'success');
    closeModal('memberModal');
    loadMembers(currentPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// 검색
document.getElementById('searchBtn')?.addEventListener('click', () => loadMembers(1));
document.getElementById('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') loadMembers(1); });

// 모달 닫기
document.getElementById('modalClose')?.addEventListener('click',  () => closeModal('memberModal'));
document.getElementById('modalCancelBtn')?.addEventListener('click', () => closeModal('memberModal'));
document.getElementById('memberModal')?.addEventListener('click', e => { if (e.target.id === 'memberModal') closeModal('memberModal'); });

// 초기 로드
loadMembers();

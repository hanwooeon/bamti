'use strict';

async function loadDashboard() {
  try {
    const [mStats, csStats] = await Promise.all([
      apiFetch('/members/stats'),
      apiFetch('/cs/stats'),
    ]);

    document.getElementById('stat-total-m').textContent   = mStats.total;
    document.getElementById('stat-active').textContent     = mStats.active;
    document.getElementById('stat-new-week-m').textContent = mStats.new_week;
    document.getElementById('stat-suspended').textContent  = mStats.suspended;
    document.getElementById('stat-kids').textContent       = mStats.kids;
    document.getElementById('stat-adult').textContent      = mStats.adult;

    document.getElementById('stat-total-cs').textContent   = csStats.total;
    document.getElementById('stat-pending').textContent    = csStats.pending;
    document.getElementById('stat-inprogress').textContent = csStats.in_progress;
    document.getElementById('stat-resolved').textContent   = csStats.resolved;
    document.getElementById('stat-new-week-cs').textContent= csStats.new_week;
  } catch (err) {
    showToast('데이터 로드 실패: ' + err.message, 'error');
  }
}

loadDashboard();

/**
 * 배워볼LANG - 공통 JavaScript
 * 내비게이션, 스크롤, 공통 유틸리티
 */
'use strict';

/* ── 내비게이션 ── */
(function initNavbar() {
  const navbar    = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  if (!navbar) return;

  // 스크롤 시 그림자 추가
  const handleScroll = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 모바일 햄버거 메뉴
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
  }
})();

/* ── 부드러운 스크롤 (앵커 링크) ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // 네비게이션 높이 여유
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── 동의 상세 펼치기/접기 ── */
(function initConsentToggles() {
  document.querySelectorAll('.consent-item__toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const detail   = document.getElementById(targetId);
      if (!detail) return;
      const isOpen = detail.classList.toggle('open');
      this.setAttribute('aria-expanded', String(isOpen));
      this.textContent = isOpen ? '접기 ▲' : '자세히 보기 ▾';
    });
  });
})();

/* ── 목차 활성화 (정책 페이지) ── */
(function initTocHighlight() {
  const tocLinks = document.querySelectorAll('.policy-toc__list a');
  if (!tocLinks.length) return;

  const sections = Array.from(tocLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 120) current = section.id;
    });
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 홈페이지 과정 탭 필터 ── */
(function initCourseTabs() {
  const tabs       = document.querySelectorAll('.target-tab');
  const cards      = document.querySelectorAll('.course-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // 탭 활성화
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // 카드 필터
      const filter = this.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.target === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ── 공통 유틸 ── */
const LingoUtils = {
  /**
   * 전화번호 자동 하이픈 포맷
   * @param {string} value
   * @returns {string}
   */
  formatPhone(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return digits.slice(0, 3) + '-' + digits.slice(3);
    return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7, 11);
  },

  /**
   * 이메일 유효성 검사
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * 생년월일로 나이 계산
   * @param {string} birthDate  YYYY-MM-DD
   * @returns {number}
   */
  calcAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },

  /**
   * 폼 에러 표시
   * @param {string} fieldId  에러 메시지 엘리먼트 id
   * @param {string} message  에러 문자열 (빈 문자열이면 숨김)
   */
  showError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('visible', !!message);
  },

  /**
   * 폼 필드 에러/성공 상태 토글
   * @param {string} inputId
   * @param {boolean} isError
   */
  setFieldState(inputId, isError) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.toggle('error', isError);
    el.classList.toggle('success', !isError && el.value.length > 0);
  }
};

/* ── 네비게이션 로그인 상태 표시 ── */
(function initNavAuth() {
  const navGuest    = document.getElementById('navGuest');
  const navMember   = document.getElementById('navMember');
  const navUsername = document.getElementById('navUsername');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  if (!navGuest || !navMember) return;

  const token    = localStorage.getItem('memberToken');
  const infoRaw  = localStorage.getItem('memberInfo');

  if (token && infoRaw) {
    try {
      const info = JSON.parse(infoRaw);
      navGuest.style.display  = 'none';
      navMember.style.display = 'flex';
      if (navUsername) navUsername.textContent = info.name + ' 님';
    } catch {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberInfo');
    }
  }

  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', function () {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberInfo');
      window.location.reload();
    });
  }
})();

// 전화번호 입력 필드 자동 포맷 적용
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', function () {
    const pos = this.selectionStart;
    const prev = this.value;
    const formatted = LingoUtils.formatPhone(this.value);
    this.value = formatted;
    // 커서 위치 보정
    if (formatted.length > prev.length) {
      this.setSelectionRange(pos + 1, pos + 1);
    }
  });
});

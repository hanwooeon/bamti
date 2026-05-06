/**
 * 배워볼LANG - 홈페이지 JavaScript
 */
'use strict';

// 숫자 카운팅 애니메이션 (통계 배너)
(function initCounterAnimation() {
  const counters = document.querySelectorAll('.stats-banner__number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const text  = el.textContent;
      const match = text.match(/[\d,]+/);
      if (!match) return;

      const target = parseInt(match[0].replace(',', ''));
      const suffix = text.replace(/[\d,]+/, '');
      let start = 0;
      const duration = 1200;
      const step = Math.ceil(target / (duration / 16));

      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = start.toLocaleString() + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/**
 * 배워볼LANG - 회원가입 JavaScript
 * ISMS-P 준수: 유효성 검사, 단계별 처리, 동의 로직
 */
'use strict';

/* ── 상수 ── */
const MINOR_AGE_THRESHOLD = 14; // 만 14세 미만 법정대리인 동의 필요 (개인정보보호법 제22조 제6항)

/* ── 상태 ── */
let currentStep = 1;
let isMinor = false;

/* ── 요소 참조 ── */
const $ = id => document.getElementById(id);

// 스텝 패널
const panels = {
  1: $('step1'),
  2: $('step2'),
  3: $('step3'),
  4: $('step4'),
};

// 스텝 인디케이터
const indicators = {
  1: $('step-indicator-1'),
  2: $('step-indicator-2'),
  3: $('step-indicator-3'),
  4: $('step-indicator-4'),
};

/* ── 스텝 이동 ── */
function goToStep(step) {
  // 현재 스텝 숨기기
  if (panels[currentStep]) {
    panels[currentStep].classList.remove('active');
  }

  // 인디케이터 업데이트
  for (let i = 1; i <= 4; i++) {
    const ind = indicators[i];
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    const circle = ind.querySelector('.stepper__circle');

    if (i < step) {
      ind.classList.add('done');
      if (circle) circle.textContent = '✓';
      if (circle) circle.setAttribute('aria-label', `${i}단계 완료`);
    } else if (i === step) {
      ind.classList.add('active');
      if (circle) circle.textContent = String(i);
      if (circle) circle.setAttribute('aria-current', 'step');
    } else {
      if (circle) circle.textContent = String(i);
      if (circle) circle.removeAttribute('aria-current');
    }
  }

  currentStep = step;

  // 새 스텝 보이기
  if (panels[step]) {
    panels[step].classList.add('active');
  }

  // 스크롤 상단으로
  const card = document.querySelector('.register-card');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ── STEP 1: 회원 유형 선택 ── */
(function initStep1() {
  // 라디오 카드 UI
  document.querySelectorAll('.member-type-card').forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (!radio) return;

    card.addEventListener('click', () => {
      document.querySelectorAll('.member-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      radio.checked = true;
    });

    radio.addEventListener('change', () => {
      document.querySelectorAll('.member-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  $('step1Next')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="memberType"]:checked');
    if (!selected) {
      LingoUtils.showError('step1Error', '수강 유형을 선택해주세요.');
      return;
    }
    LingoUtils.showError('step1Error', '');
    goToStep(2);
  });
})();

/* ── STEP 2: 기본 정보 입력 ── */
(function initStep2() {

  // 생년월일 변경 → 미성년자 여부 판단
  $('userBirth')?.addEventListener('change', function () {
    if (!this.value) return;
    const age = LingoUtils.calcAge(this.value);
    isMinor = age < MINOR_AGE_THRESHOLD;

    const minorNotice     = $('minorNotice');
    const guardianSection = $('guardianSection');
    const guardianConsentSection = $('guardianConsentSection');

    if (minorNotice)     minorNotice.classList.toggle('visible', isMinor);
    if (guardianSection) guardianSection.classList.toggle('visible', isMinor);

    // Step 3의 법정대리인 동의 섹션 표시
    if (guardianConsentSection) {
      guardianConsentSection.style.display = isMinor ? '' : 'none';
      const guardianCheckbox = $('consentGuardian');
      if (guardianCheckbox) {
        guardianCheckbox.required = isMinor;
      }
    }

    // 법정대리인 필드 required 속성 설정
    const guardianFields = ['guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail'];
    guardianFields.forEach(id => {
      const el = $(id);
      if (el) el.required = isMinor;
    });

    // 유효성 검사 피드백
    if (this.value) {
      const maxDate = new Date();
      const minDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear());  // 오늘
      minDate.setFullYear(minDate.getFullYear() - 100); // 100년 전

      const inputDate = new Date(this.value);
      if (inputDate > new Date()) {
        LingoUtils.showError('userBirthError', '생년월일은 오늘 이전 날짜여야 합니다.');
        LingoUtils.setFieldState('userBirth', true);
      } else {
        LingoUtils.showError('userBirthError', '');
        LingoUtils.setFieldState('userBirth', false);
      }
    }
  });

  // 비밀번호 강도 검사
  $('userPassword')?.addEventListener('input', function () {
    const pw = this.value;
    const strengthEl = $('passwordStrength');
    const fill       = $('strengthFill');
    const text       = $('strengthText');

    if (!pw) {
      if (strengthEl) strengthEl.classList.remove('visible');
      return;
    }

    if (strengthEl) strengthEl.classList.add('visible');

    const hasLength  = pw.length >= 8;
    const hasUpper   = /[A-Z]/.test(pw);
    const hasLower   = /[a-z]/.test(pw);
    const hasNumber  = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);

    const score = [hasLength, hasUpper || hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (fill && text) {
      fill.className = 'password-strength__fill';
      if (score <= 2) {
        fill.classList.add('weak');
        text.textContent = '약함 - 영문·숫자·특수문자를 모두 포함해주세요.';
        text.style.color = 'var(--color-error)';
      } else if (score === 3) {
        fill.classList.add('medium');
        text.textContent = '보통 - 특수문자를 추가하면 더 안전합니다.';
        text.style.color = 'var(--color-warning)';
      } else {
        fill.classList.add('strong');
        text.textContent = '강함 - 안전한 비밀번호입니다.';
        text.style.color = 'var(--color-success)';
      }
    }
  });

  // 비밀번호 확인 일치 검사
  $('userPasswordConfirm')?.addEventListener('input', function () {
    const pw        = $('userPassword')?.value || '';
    const isMatch   = this.value === pw;
    LingoUtils.setFieldState('userPasswordConfirm', !isMatch && this.value.length > 0);
    if (!isMatch && this.value.length > 0) {
      LingoUtils.showError('userPasswordConfirmError', '비밀번호가 일치하지 않습니다.');
    } else {
      LingoUtils.showError('userPasswordConfirmError', '');
    }
  });

  // 이전 버튼
  $('step2Prev')?.addEventListener('click', () => goToStep(1));

  // 다음 버튼 - Step 2 유효성 검사
  $('step2Next')?.addEventListener('click', () => {
    if (!validateStep2()) return;
    goToStep(3);
  });
})();

/**
 * Step 2 유효성 검사
 * @returns {boolean}
 */
function validateStep2() {
  let valid = true;

  // 이름
  const userName = $('userName')?.value.trim();
  if (!userName) {
    LingoUtils.showError('userNameError', '이름을 입력해주세요.');
    LingoUtils.setFieldState('userName', true);
    valid = false;
  } else if (userName.length < 2) {
    LingoUtils.showError('userNameError', '이름은 2자 이상 입력해주세요.');
    LingoUtils.setFieldState('userName', true);
    valid = false;
  } else {
    LingoUtils.showError('userNameError', '');
    LingoUtils.setFieldState('userName', false);
  }

  // 생년월일
  const birth = $('userBirth')?.value;
  if (!birth) {
    LingoUtils.showError('userBirthError', '생년월일을 입력해주세요.');
    LingoUtils.setFieldState('userBirth', true);
    valid = false;
  } else if (new Date(birth) > new Date()) {
    LingoUtils.showError('userBirthError', '생년월일은 오늘 이전 날짜여야 합니다.');
    LingoUtils.setFieldState('userBirth', true);
    valid = false;
  } else {
    LingoUtils.showError('userBirthError', '');
    LingoUtils.setFieldState('userBirth', false);
  }

  // 이메일
  const email = $('userEmail')?.value.trim();
  if (!email) {
    LingoUtils.showError('userEmailError', '이메일 주소를 입력해주세요.');
    LingoUtils.setFieldState('userEmail', true);
    valid = false;
  } else if (!LingoUtils.isValidEmail(email)) {
    LingoUtils.showError('userEmailError', '유효한 이메일 주소를 입력해주세요. (예: name@email.com)');
    LingoUtils.setFieldState('userEmail', true);
    valid = false;
  } else {
    LingoUtils.showError('userEmailError', '');
    LingoUtils.setFieldState('userEmail', false);
  }

  // 전화번호
  const phone = $('userPhone')?.value.replace(/\D/g, '');
  if (!phone) {
    LingoUtils.showError('userPhoneError', '휴대전화 번호를 입력해주세요.');
    LingoUtils.setFieldState('userPhone', true);
    valid = false;
  } else if (!/^01[016789]\d{7,8}$/.test(phone)) {
    LingoUtils.showError('userPhoneError', '유효한 휴대전화 번호를 입력해주세요. (예: 010-0000-0000)');
    LingoUtils.setFieldState('userPhone', true);
    valid = false;
  } else {
    LingoUtils.showError('userPhoneError', '');
    LingoUtils.setFieldState('userPhone', false);
  }

  // 비밀번호
  const password = $('userPassword')?.value;
  const pwRegex  = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!password) {
    LingoUtils.showError('userPasswordError', '비밀번호를 입력해주세요.');
    LingoUtils.setFieldState('userPassword', true);
    valid = false;
  } else if (!pwRegex.test(password)) {
    LingoUtils.showError('userPasswordError', '영문·숫자·특수문자를 모두 포함하여 8자 이상 입력해주세요.');
    LingoUtils.setFieldState('userPassword', true);
    valid = false;
  } else {
    LingoUtils.showError('userPasswordError', '');
    LingoUtils.setFieldState('userPassword', false);
  }

  // 비밀번호 확인
  const passwordConfirm = $('userPasswordConfirm')?.value;
  if (!passwordConfirm) {
    LingoUtils.showError('userPasswordConfirmError', '비밀번호 확인을 입력해주세요.');
    LingoUtils.setFieldState('userPasswordConfirm', true);
    valid = false;
  } else if (password !== passwordConfirm) {
    LingoUtils.showError('userPasswordConfirmError', '비밀번호가 일치하지 않습니다.');
    LingoUtils.setFieldState('userPasswordConfirm', true);
    valid = false;
  } else {
    LingoUtils.showError('userPasswordConfirmError', '');
    LingoUtils.setFieldState('userPasswordConfirm', false);
  }

  // 미성년자 법정대리인 정보 검사
  if (isMinor) {
    const guardianName = $('guardianName')?.value.trim();
    if (!guardianName) {
      LingoUtils.showError('guardianNameError', '법정대리인 이름을 입력해주세요.');
      LingoUtils.setFieldState('guardianName', true);
      valid = false;
    } else {
      LingoUtils.showError('guardianNameError', '');
      LingoUtils.setFieldState('guardianName', false);
    }

    const guardianRelation = $('guardianRelation')?.value;
    if (!guardianRelation) {
      LingoUtils.showError('guardianRelationError', '법정대리인과의 관계를 선택해주세요.');
      LingoUtils.setFieldState('guardianRelation', true);
      valid = false;
    } else {
      LingoUtils.showError('guardianRelationError', '');
      LingoUtils.setFieldState('guardianRelation', false);
    }

    const guardianPhone = $('guardianPhone')?.value.replace(/\D/g, '');
    if (!guardianPhone) {
      LingoUtils.showError('guardianPhoneError', '법정대리인 휴대전화 번호를 입력해주세요.');
      LingoUtils.setFieldState('guardianPhone', true);
      valid = false;
    } else if (!/^01[016789]\d{7,8}$/.test(guardianPhone)) {
      LingoUtils.showError('guardianPhoneError', '유효한 휴대전화 번호를 입력해주세요.');
      LingoUtils.setFieldState('guardianPhone', true);
      valid = false;
    } else {
      LingoUtils.showError('guardianPhoneError', '');
      LingoUtils.setFieldState('guardianPhone', false);
    }

    const guardianEmail = $('guardianEmail')?.value.trim();
    if (!guardianEmail) {
      LingoUtils.showError('guardianEmailError', '법정대리인 이메일을 입력해주세요.');
      LingoUtils.setFieldState('guardianEmail', true);
      valid = false;
    } else if (!LingoUtils.isValidEmail(guardianEmail)) {
      LingoUtils.showError('guardianEmailError', '유효한 이메일 주소를 입력해주세요.');
      LingoUtils.setFieldState('guardianEmail', true);
      valid = false;
    } else {
      LingoUtils.showError('guardianEmailError', '');
      LingoUtils.setFieldState('guardianEmail', false);
    }
  }

  if (!valid) {
    LingoUtils.showError('step2Error', '위 항목을 모두 올바르게 입력해주세요.');
    // 첫 번째 에러 필드로 포커스
    const firstError = document.querySelector('#step2 .form-input.error');
    if (firstError) firstError.focus();
  } else {
    LingoUtils.showError('step2Error', '');
  }

  return valid;
}

/* ── STEP 3: 약관 동의 ── */
(function initStep3() {

  // ─ 전체 동의 체크박스 ─
  const consentAll = $('consentAll');

  // 필수 체크박스 목록
  const requiredCheckboxIds = ['consentTerms', 'consentPrivacyService', 'consentPrivacyPayment', 'consentThirdParty'];
  // 선택 체크박스 목록
  const optionalCheckboxIds = ['consentMarketing', 'consentAdReceive'];
  // 전체 동의 관련 체크박스 (필수 + 선택)
  const allConsentIds = [...requiredCheckboxIds, ...optionalCheckboxIds];

  /**
   * 전체 동의 체크박스 상태 갱신
   */
  function updateConsentAll() {
    const allChecked = allConsentIds.every(id => $(id)?.checked);
    if (consentAll) consentAll.checked = allChecked;
  }

  // 전체 동의 클릭 시 → 모두 체크/해제
  consentAll?.addEventListener('change', function () {
    const checked = this.checked;
    allConsentIds.forEach(id => {
      const el = $(id);
      if (el) el.checked = checked;
    });
    // 미성년자 법정대리인 동의
    const guardianCb = $('consentGuardian');
    if (guardianCb && isMinor) guardianCb.checked = checked;
  });

  // 개별 체크박스 변경 시 → 전체 동의 상태 갱신
  allConsentIds.forEach(id => {
    $(id)?.addEventListener('change', updateConsentAll);
  });
  $('consentGuardian')?.addEventListener('change', updateConsentAll);

  // 이전 버튼
  $('step3Prev')?.addEventListener('click', () => goToStep(2));

  // 가입 완료 버튼 → Step 3 유효성 검사
  $('step3Next')?.addEventListener('click', () => {
    if (!validateStep3()) return;
    submitRegister();
  });
})();

/**
 * Step 3 유효성 검사 (필수 동의 확인)
 * @returns {boolean}
 */
function validateStep3() {
  let valid = true;
  const errors = [];

  // 필수 동의 항목 확인
  const requiredItems = [
    { id: 'consentTerms',          label: '이용약관' },
    { id: 'consentPrivacyService', label: '개인정보 수집·이용 동의 (서비스 제공)' },
    { id: 'consentPrivacyPayment', label: '개인정보 수집·이용 동의 (결제·환불)' },
    { id: 'consentThirdParty',     label: '개인정보 제3자 제공 동의' },
  ];

  requiredItems.forEach(item => {
    if (!$(item.id)?.checked) {
      errors.push(`[필수] ${item.label}에 동의해주세요.`);
      valid = false;
    }
  });

  // 미성년자 법정대리인 동의
  if (isMinor && !$('consentGuardian')?.checked) {
    errors.push('[필수] 법정대리인(보호자) 동의 확인이 필요합니다.');
    valid = false;
  }

  if (!valid) {
    LingoUtils.showError('step3Error', errors[0]);
    // 첫 번째 미동의 체크박스로 포커스
    const firstUnchecked = document.querySelector('#step3 input[type="checkbox"][required]:not(:checked)');
    if (firstUnchecked) firstUnchecked.focus();
  } else {
    LingoUtils.showError('step3Error', '');
  }

  return valid;
}

/**
 * 가입 처리 - API 서버 연동
 */
async function submitRegister() {
  const btn = $('step3Next');
  if (btn) { btn.disabled = true; btn.textContent = '처리 중...'; }

  try {
    const payload = {
      memberType:   document.querySelector('input[name="memberType"]:checked')?.value,
      name:         $('userName')?.value.trim(),
      birthDate:    $('userBirth')?.value,
      email:        $('userEmail')?.value.trim(),
      phone:        $('userPhone')?.value.trim(),
      password:     $('userPassword')?.value,
      interestLang: $('userInterestLang')?.value || null,
      isMinor:      isMinor,

      // 법정대리인 (미성년자)
      guardianName:     isMinor ? $('guardianName')?.value.trim()  : null,
      guardianRelation: isMinor ? $('guardianRelation')?.value     : null,
      guardianPhone:    isMinor ? $('guardianPhone')?.value.trim() : null,
      guardianEmail:    isMinor ? $('guardianEmail')?.value.trim() : null,

      // 동의 항목
      consentTerms:           $('consentTerms')?.checked,
      consentPrivacyService:  $('consentPrivacyService')?.checked,
      consentPrivacyPayment:  $('consentPrivacyPayment')?.checked,
      consentThirdParty:      $('consentThirdParty')?.checked,
      consentMarketing:       $('consentMarketing')?.checked,
      consentAdReceive:       $('consentAdReceive')?.checked,
      consentGuardian:        isMinor ? $('consentGuardian')?.checked : false,
    };

    const res = await fetch('/api/members/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '회원가입에 실패했습니다.');

    // 성공 → Step 4
    const doneUserName = $('doneUserName');
    if (doneUserName) doneUserName.textContent = payload.name;
    goToStep(4);

  } catch (err) {
    LingoUtils.showError('step3Error', err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '가입 완료'; }
  }
}

/* ── 홈페이지 index.js 내용 (홈에서만 사용) ── */

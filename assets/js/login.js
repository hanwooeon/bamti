'use strict';

(function () {
  const form        = document.getElementById('loginForm');
  const emailInput  = document.getElementById('loginEmail');
  const pwInput     = document.getElementById('loginPassword');
  const pwToggle    = document.getElementById('passwordToggle');
  const emailError  = document.getElementById('emailError');
  const pwError     = document.getElementById('passwordError');
  const errorBox    = document.getElementById('loginErrorBox');
  const loginBtn    = document.getElementById('loginBtn');

  // 비밀번호 표시/숨기기 토글
  pwToggle.addEventListener('click', function () {
    const isPassword = pwInput.type === 'password';
    pwInput.type = isPassword ? 'text' : 'password';
    pwToggle.textContent = isPassword ? '숨기기' : '보기';
  });

  function showError(element, message) {
    element.textContent = message;
    element.previousElementSibling && element.previousElementSibling.classList.toggle('error', !!message);
  }

  function showBoxError(message) {
    errorBox.textContent = message;
    errorBox.classList.toggle('show', !!message);
  }

  function clearErrors() {
    emailError.textContent = '';
    pwError.textContent = '';
    emailInput.classList.remove('error');
    pwInput.classList.remove('error');
    showBoxError('');
  }

  function validate() {
    let valid = true;

    if (!emailInput.value.trim()) {
      emailError.textContent = '이메일을 입력해주세요.';
      emailInput.classList.add('error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
      emailInput.classList.add('error');
      valid = false;
    }

    if (!pwInput.value) {
      pwError.textContent = '비밀번호를 입력해주세요.';
      pwInput.classList.add('error');
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    if (!validate()) return;

    loginBtn.disabled = true;
    loginBtn.textContent = '로그인 중...';

    try {
      const res = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: pwInput.value,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        showBoxError('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (!res.ok) {
        showBoxError(data.error || '로그인에 실패했습니다.');
        return;
      }

      localStorage.setItem('memberToken', data.token);
      localStorage.setItem('memberInfo', JSON.stringify(data.member));

      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl');
      window.location.href = returnUrl ? returnUrl : '../index.html';

    } catch (err) {
      console.error('로그인 오류:', err);
      if (location.protocol === 'file:') {
        showBoxError('페이지를 파일로 직접 열면 로그인할 수 없습니다. 서버를 실행한 후 http://localhost:8080/pages/login.html 로 접속해주세요.');
      } else {
        showBoxError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = '로그인';
    }
  });
})();

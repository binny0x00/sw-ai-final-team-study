import { useEffect, useState } from 'react';
import { api } from './api';

import './style.css';

type User = {
  id: string;
  name: string;
  email: string;
};

export default function App() {

  const [mode, setMode] = useState<'login' | 'register'>('login');
  // 로그인 유무
  const [user, setUser] = useState<User | null>(null);

  // input에 입력한 값들
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 에러 메시지
  const [message, setMessage] = useState('');

  const loadMe = async () => {
    try {
      const res = await api.get<User>('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  // 화면이 처음 열릴 때 로그인 상태를 확인합니다.
  useEffect(() => {
    void loadMe();
  }, []);

  // 로그인 또는 회원가입 버튼 눌렀을 때
  const submit = async () => {
    setMessage('');

    try {
      if (mode === 'register') {
        await api.post('/auth/register', { name, email, password });
      } else {
        await api.post('/auth/login', { email, password });
      }

      // 성공하면 내 정보를 다시 불러와 로그인 성공 화면 보여줌
      await loadMe();
    } catch {
      setMessage('입력값을 확인해주세요.');
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    // 로그인 화면으로 돌아감
    setUser(null);
  };

  // user가 있으면 로그인 성공 화면
  if (user) {
    return (
        <main className="page">
          <section className="card">
            <h1>로그인 성공</h1>
            <p>이름: {user.name}</p>
            <p>이메일: {user.email}</p>
            <button onClick={logout}>로그아웃</button>
          </section>
        </main>
    );
  }

  // user가 없으면 로그인/회원가입 화면
  return (
      <main className="page">
        <section className="card">
          <h1>{mode === 'login' ? '로그인' : '회원가입'}</h1>

          {/* 회원가입 모드일 때만 이름 입력창을 보여줍니다. */}
          {mode === 'register' && (
              <input
                  placeholder="이름"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
              />
          )}

          <input
              placeholder="이메일"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
          />

          <input
              placeholder="비밀번호"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
          />

          {mode === 'register' && (
              <p className="hint">비밀번호는 8글자 이상 입력해주세요.</p>
          )}

          {message && <p className="error">{message}</p>}

          <button onClick={submit}>{mode === 'login' ? '로그인' : '회원가입'}</button>

          <button
              className="link"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? '회원가입 화면으로' : '로그인 화면으로'}
          </button>
        </section>
      </main>
  );
}
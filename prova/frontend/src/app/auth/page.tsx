'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserFormProps = {
  nickname: string;
  password: string;
  onNicknameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  error: string | null;
  nicknameError?: string;
  passwordError?: string;
};

function UserForm({
  nickname,
  password,
  onNicknameChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  error,
  nicknameError,
  passwordError,
}: UserFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-md flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-800">Autenticação</h1>
      <p className="text-sm text-slate-600">Entre com seu apelido e senha para acessar o painel.</p>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        <span>Apelido</span>
        <input
          type="text"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          className={`rounded-md border px-3 py-2 outline-none focus:ring-2 ${
            nicknameError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-200'
          }`}
          placeholder="Digite seu apelido"
          autoComplete="username"
        />
        {nicknameError ? <span className="text-xs text-red-500">{nicknameError}</span> : null}
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        <span>Senha</span>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`rounded-md border px-3 py-2 outline-none focus:ring-2 ${
            passwordError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-200'
          }`}
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />
        {passwordError ? <span className="text-xs text-red-500">{passwordError}</span> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? 'Autenticando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextNicknameError = nickname.trim().length >= 3 ? '' : 'Informe um apelido com pelo menos 3 caracteres.';
    const nextPasswordError = password.trim().length >= 6 ? '' : 'Informe uma senha com pelo menos 6 caracteres.';

    setNicknameError(nextNicknameError);
    setPasswordError(nextPasswordError);

    return !nextNicknameError && !nextPasswordError;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: nickname.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Não foi possível autenticar o usuário.');
      }

      const data = await response.json();
      const storedUser = data.user ?? data;
      const userData = {
        ...storedUser,
        accessToken: data.token ?? storedUser.token,
      };

      localStorage.setItem('auth-user', JSON.stringify(userData));
      localStorage.setItem('auth-token', userData.accessToken);

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <UserForm
        nickname={nickname}
        password={password}
        onNicknameChange={setNickname}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        nicknameError={nicknameError}
        passwordError={passwordError}
      />
    </main>
  );
}

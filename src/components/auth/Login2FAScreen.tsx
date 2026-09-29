import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  UserCheck, 
  Building2, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { UserProfile } from '../../types/os';

export const Login2FAScreen: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    loginWith2FA, 
    unlockSession, 
    isLocked, 
    isAuthenticated 
  } = useOS();

  // Step 1: Select User / Password, Step 2: 2FA Verification
  const [step, setStep] = useState<'credentials' | '2fa'>(isLocked ? '2fa' : 'credentials');
  const [selectedUser, setSelectedUser] = useState<UserProfile>(currentUser || users[0]);
  const [password, setPassword] = useState('esdinex@2026');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'totp' | 'certificado_a3' | 'sms'>('totp');
  
  // 6-digit TOTP input state
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Token A3 PIN state
  const [pinA3, setPinA3] = useState('');

  // Simulated TOTP generation with 30s countdown
  const [simulatedCode, setSimulatedCode] = useState('742819');
  const [countdown, setCountdown] = useState(24);
  const [copiedCode, setCopiedCode] = useState(false);

  // Status and error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-generate fresh TOTP codes every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const fresh = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedCode(fresh);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update method according to user preference
  useEffect(() => {
    if (selectedUser?.twoFactorMethod) {
      setTwoFactorMethod(selectedUser.twoFactorMethod);
    }
  }, [selectedUser]);

  // Handle digit input in 2FA fields
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...totpDigits];
    newDigits[index] = val.slice(-1);
    setTotpDigits(newDigits);
    setErrorMessage(null);

    // Auto-focus next field
    if (val && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteDigits = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...totpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setTotpDigits(newDigits);
      if (pasted.length === 6) {
        digitRefs.current[5]?.focus();
      }
    }
  };

  const fillSimulatedCode = () => {
    const chars = simulatedCode.split('');
    setTotpDigits(chars);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Step 1: Submit credentials
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedUser.status === 'bloqueado') {
      setErrorMessage('Esta conta foi temporariamente bloqueada pelo Administrador de Segurança.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, informe a senha de acesso.');
      return;
    }

    // Proceed to Step 2 (2FA)
    setStep('2fa');
    setTimeout(() => digitRefs.current[0]?.focus(), 150);
  };

  // Step 2: Verify 2FA
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    const fullCode = totpDigits.join('');

    setTimeout(() => {
      setIsVerifying(false);

      if (twoFactorMethod === 'certificado_a3') {
        if (pinA3.length < 4) {
          setErrorMessage('PIN do Certificado Digital inválido (mínimo de 4 dígitos).');
          return;
        }
      } else {
        if (fullCode.length !== 6) {
          setErrorMessage('Informe os 6 dígitos do código autenticador.');
          return;
        }
      }

      // Successful 2FA verification
      if (isLocked) {
        unlockSession(fullCode || 'CERT_A3_PIN');
      } else {
        loginWith2FA({
          email: selectedUser.email,
          password,
          token2fa: fullCode || 'CERT_A3_PIN',
          method: twoFactorMethod,
        });
      }
    }, 600);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 flex items-center justify-center font-sans">
      {/* Background Wallpaper with deep blur */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/src/assets/images/cartorio_os_wallpaper_1790688528097.jpg"
          alt="ESDINeX Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 scale-105 filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
      </div>

      {/* Corporate Security Watermark / Header */}
      <div className="absolute top-6 left-8 flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-lg shadow-blue-900/50">
          ESDI
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>ESDINeX Enterprise OS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v3.1
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Ambiente Corporativo de Suporte de TI
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-8 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-emerald-400 z-10 font-mono">
        <ShieldCheck className="w-4 h-4" />
        <span>2FA Obrigatório · Políticas de Segurança da Informação</span>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-20 w-full max-w-md mx-4 p-8 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
            {step === 'credentials' ? <Lock className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isLocked
              ? 'Sessão Bloqueada'
              : step === 'credentials'
              ? 'Acesso Seguro ao ESDINeX'
              : 'Verificação em Duas Etapas (2FA)'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLocked
              ? 'Confirme o token de segurança para retomar o trabalho'
              : step === 'credentials'
              ? 'Selecione o operador técnico ou digite suas credenciais'
              : `Autenticação secundária exigida para ${selectedUser.name}`}
          </p>
        </div>

        {/* Error message toast */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS SELECTION */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
            {/* User Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Técnico / Analista de TI</span>
                <span className="text-[10px] text-blue-400 font-mono">RBAC Ativo</span>
              </label>

              <div className="grid grid-cols-1 gap-2">
                {users.map(u => {
                  const isSel = selectedUser.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setErrorMessage(null); }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSel
                          ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSel ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-semibold truncate ${isSel ? 'text-white' : 'text-slate-200'}`}>
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-mono">
                            {u.role} · {u.clienteAtribuicao || u.departamento || 'Central ESDI'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          2FA
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <label className="font-medium">Senha Corporativa</label>
                <span className="text-[10px] text-slate-500 font-mono">Padrão demo: esdinex@2026</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
            >
              <span>Avançar para Verificação 2FA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: TWO-FACTOR AUTHENTICATION (2FA) */}
        {step === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-4 text-xs">
            {/* User profile recap banner */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate text-[11px]">{selectedUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{selectedUser.email}</div>
                </div>
              </div>

              {!isLocked && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Alterar
                </button>
              )}
            </div>

            {/* 2FA Method Selector */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setTwoFactorMethod('totp')}
                className={`py-1 rounded font-medium transition-colors ${
                  twoFactorMethod === 'totp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                App TOTP
              </button>
              <button
                type="button"
                onClick={() => setTwoFactorMethod('certificado_a3')}
                className={`py-1 rounded font-medium transition-colors ${
                  twoFactorMethod === 'certificado_a3' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Certificado A3
              </button>
              <button
                type="button"
                onClick={() => setTwoFactorMethod('sms')}
                className={`py-1 rounded font-medium transition-colors ${
                  twoFactorMethod === 'sms' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SMS Token
              </button>
            </div>

            {/* METHOD 1: TOTP 6-DIGIT CODE */}
            {twoFactorMethod === 'totp' && (
              <div className="space-y-3">
                <label className="text-slate-300 font-medium block text-center">
                  Digite o código de 6 dígitos do seu Autenticador:
                </label>

                <div className="flex justify-center gap-2" onPaste={handlePasteDigits}>
                  {totpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { digitRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  ))}
                </div>

                {/* Simulated live authenticator box for seamless testing */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Simulador de Autenticador Corporativo:</span>
                    </span>
                    <span className="font-mono text-emerald-400">{countdown}s</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="font-mono text-base font-bold text-white tracking-widest">
                      {simulatedCode.slice(0, 3)} {simulatedCode.slice(3)}
                    </span>
                    <button
                      type="button"
                      onClick={fillSimulatedCode}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Preenchido!' : 'Usar Código'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: CERTIFICADO ICP-BRASIL A3 */}
            {twoFactorMethod === 'certificado_a3' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Token Criptográfico Detectado</span>
                    <span className="text-[10px] font-mono text-emerald-400">Token USB / A3</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">SafeNet eToken 5110 · Certificado Digital A3</div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">PIN do Certificado Digital A3</label>
                  <input
                    type="password"
                    placeholder="Digite o PIN do token (4-8 dígitos)..."
                    value={pinA3}
                    onChange={e => setPinA3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* METHOD 3: SMS TOKEN */}
            {twoFactorMethod === 'sms' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 text-center">
                  Código de segurança enviado via SMS para o número <strong>{selectedUser.phone || '(11) 9****-2233'}</strong>:
                </p>
                <div className="flex justify-center gap-2" onPaste={handlePasteDigits}>
                  {totpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { digitRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando 2FA Criptográfico...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar e Iniciar Sessão ESDINeX</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Footer Compliance */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Políticas de Segurança da Informação & ISO 27001</span>
          <span>Sessão Criptografada AES-256</span>
        </div>
      </div>
    </div>
  );
};

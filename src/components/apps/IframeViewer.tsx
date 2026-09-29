import React, { useState } from 'react';
import { ExternalLink, ShieldAlert, ShieldCheck, RefreshCw, AlertCircle, ArrowUpRight, Lock } from 'lucide-react';

interface IframeViewerProps {
  url?: string;
  title: string;
  blocksIframe?: boolean;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({ url, title, blocksIframe = false }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(!blocksIframe);
  const [forceIframe, setForceIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const handleReload = () => {
    setIsLoading(true);
    setIframeError(false);
    setIframeKey(k => k + 1);
  };

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <AlertCircle className="w-10 h-10 mb-3 text-slate-500" />
        <p className="text-sm font-medium">Nenhuma URL configurada para esta aplicação.</p>
      </div>
    );
  }

  // If site is known to block iframe or user hasn't forced it
  if (blocksIframe && !forceIframe) {
    return (
      <div className="flex flex-col h-full bg-slate-900/90 text-slate-100">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-lg bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400 font-mono text-[11px] truncate">
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{url}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
            >
              <span>Abrir em Nova Aba</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Protection Explainer Screen */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
              <p className="text-xs text-slate-400">
                Política de Segurança Externa Detectada
              </p>
            </div>

            <div className="text-left text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">ℹ</span>
                <span>
                  Este portal governamental / central notarial emite cabeçalhos HTTP restritivos:
                </span>
              </div>
              <ul className="list-disc pl-5 font-mono text-[11px] text-slate-400 space-y-1">
                <li>X-Frame-Options: SAMEORIGIN / DENY</li>
                <li>Content-Security-Policy: frame-ancestors &apos;self&apos;</li>
              </ul>
              <p className="text-[11px] text-slate-400 pt-1">
                O navegador bloqueia a renderização em iframe para mitigar ataques de Clickjacking.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleOpenExternal}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Portal em Nova Aba</span>
              </button>
              <button
                onClick={() => {
                  setForceIframe(true);
                  setIsLoading(true);
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                title="Tenta carregar o iframe caso haja proxy reverso habilitado"
              >
                Forçar Iframe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* Browser Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs gap-3 select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReload}
            title="Recarregar"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Sandboxed</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 font-mono text-[11px] truncate">
          <Lock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenExternal}
            title="Abrir no navegador"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
          >
            <span>Nova Aba</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs text-slate-400">Carregando aplicação interna...</span>
            </div>
          </div>
        )}

        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
            <h4 className="text-sm font-semibold text-white">Falha ao carregar iframe</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              O site remoto recusou a conexão embutida. Utilize a abertura em nova aba.
            </p>
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-500"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir em Nova Aba</span>
            </button>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={url}
            title={title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setIframeError(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

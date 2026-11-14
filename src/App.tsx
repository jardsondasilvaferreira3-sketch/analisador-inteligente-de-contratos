import { useState } from 'react';
import { FileText, Sparkles, AlertCircle, Loader2, KeyRound, ScanText, ShieldCheck } from 'lucide-react';
import { analyzeContract, type AnalysisResult } from '@/lib/gemini';
import { AnalysisResults } from '@/components/AnalysisResults';

const MIN_DOC_LENGTH = 50;

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = apiKey.trim().length > 0 && documentText.trim().length >= MIN_DOC_LENGTH && !loading;

  async function handleAnalyze() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeContract(apiKey.trim(), documentText.trim());
      setResult(analysis);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao analisar o documento.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  const docCharCount = documentText.length;
  const docWordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent-500/8 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-brand-800/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-ink-800/60 backdrop-blur-sm sticky top-0 z-20 bg-ink-950/80">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/40">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight text-white">Analisador Inteligente de Contratos</h1>
                  <p className="text-xs text-ink-400">Análise jurídica com IA — Google Gemini</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-ink-800 bg-ink-900/60 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-400" />
                <span className="text-xs font-medium text-ink-300">gemini-3.8-flash</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 sm:px-8 py-8 sm:py-12">
          {result ? (
            <AnalysisResults result={result} onReset={handleReset} />
          ) : (
            <div className="animate-fade-in">
              {/* Hero */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/60 px-4 py-1.5">
                  <ScanText className="h-3.5 w-3.5 text-brand-400" />
                  <span className="text-xs font-medium text-ink-300">Cole seu contrato e receba uma análise instantânea</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white leading-tight">
                  Entenda o que você está assinando
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-ink-400 leading-relaxed">
                  Receba um resumo executivo, pontos de atenção e um veredito sobre qualquer contrato ou termo — em segundos.
                </p>
              </div>

              {/* Form card */}
              <div className="rounded-2xl border border-ink-800 bg-ink-900/50 shadow-2xl shadow-black/20 overflow-hidden">
                {/* API Key section */}
                <div className="border-b border-ink-800/80 p-6 sm:p-7">
                  <label htmlFor="apiKey" className="flex items-center gap-2 text-sm font-medium text-ink-200 mb-2">
                    <KeyRound className="h-4 w-4 text-brand-400" />
                    Sua API Key do Google Gemini
                  </label>
                  <div className="relative">
                    <input
                      id="apiKey"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-xl border border-ink-700 bg-ink-950/60 px-4 py-3 pr-24 text-sm text-white placeholder:text-ink-500 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-400 hover:text-ink-200 hover:bg-ink-800/60 transition-colors"
                    >
                      {showKey ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-ink-500 leading-relaxed">
                    Sua chave é usada apenas para esta requisição e não é armazenada. Obtenha sua chave em{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
                    >
                      Google AI Studio
                    </a>
                    .
                  </p>
                </div>

                {/* Document text section */}
                <div className="p-6 sm:p-7">
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="documentText" className="flex items-center gap-2 text-sm font-medium text-ink-200">
                      <FileText className="h-4 w-4 text-brand-400" />
                      Cole aqui o contrato ou termo
                    </label>
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      {docWordCount > 0 && <span>{docWordCount} palavras</span>}
                      <span>{docCharCount} caracteres</span>
                    </div>
                  </div>
                  <textarea
                    id="documentText"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Cole o texto completo do contrato, termo de uso, política de privacidade, acordo de prestação de serviços..."
                    rows={12}
                    spellCheck={false}
                    className="w-full resize-y rounded-xl border border-ink-700 bg-ink-950/60 px-4 py-3 text-sm text-white placeholder:text-ink-500 leading-relaxed transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-mono"
                  />
                  {documentText.trim().length > 0 && documentText.trim().length < MIN_DOC_LENGTH && (
                    <p className="mt-2 text-xs text-warning-400">
                      O documento precisa ter pelo menos {MIN_DOC_LENGTH} caracteres para uma análise útil.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="border-t border-ink-800/80 bg-ink-950/40 px-6 sm:px-7 py-5">
                  {error && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 animate-slide-up">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger-400" />
                      <p className="text-sm text-danger-200 leading-relaxed">{error}</p>
                    </div>
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={!canSubmit}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition-all hover:from-brand-400 hover:to-brand-500 hover:shadow-brand-900/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analisando documento...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Analisar Documento
                      </>
                    )}
                  </button>
                  {!canSubmit && !loading && (
                    <p className="mt-2.5 text-center text-xs text-ink-500">
                      {apiKey.trim().length === 0
                        ? 'Insira sua API Key e cole um contrato para começar'
                        : documentText.trim().length < MIN_DOC_LENGTH
                        ? 'Cole um contrato com mais conteúdo para análise'
                        : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Feature highlights */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: FileText, title: 'Resumo Executivo', desc: 'Uma síntese clara do contrato em linguagem acessível.' },
                  { icon: AlertCircle, title: '3 Pontos de Atenção', desc: 'Riscos jurídicos e cláusulas críticas destacados com severidade.' },
                  { icon: ShieldCheck, title: 'Veredito Rápido', desc: 'Uma classificação final sobre o quão seguro é assinar.' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-ink-800/80 bg-ink-900/40 p-5 transition-colors hover:border-ink-700"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
                      <f.icon className="h-4.5 w-4.5 text-brand-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                    <p className="mt-1 text-xs text-ink-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-ink-800/60 mt-12">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6">
            <p className="text-center text-xs text-ink-500">
              Esta análise é gerada por IA e não substitui a consulta a um advogado. Use como ferramenta de triagem, não como parecer jurídico definitivo.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

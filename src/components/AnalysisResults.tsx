import { FileText, AlertTriangle, ShieldCheck, Gavel, ArrowLeft, Download } from 'lucide-react';
import type { AnalysisResult, RiskPoint } from '@/lib/gemini';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const severityConfig: Record<
  RiskPoint['severity'],
  { label: string; classes: string; dot: string; icon: string }
> = {
  alta: {
    label: 'Risco Alto',
    classes: 'border-danger-500/30 bg-danger-500/5',
    dot: 'bg-danger-500 text-danger-50',
    icon: 'text-danger-400',
  },
  media: {
    label: 'Risco Médio',
    classes: 'border-warning-500/30 bg-warning-500/5',
    dot: 'bg-warning-500 text-warning-950',
    icon: 'text-warning-400',
  },
  baixa: {
    label: 'Risco Baixo',
    classes: 'border-success-500/30 bg-success-500/5',
    dot: 'bg-success-500 text-success-50',
    icon: 'text-success-400',
  },
};

function normalizeSeverity(sev: string): RiskPoint['severity'] {
  const lower = sev.toLowerCase().trim();
  if (lower.startsWith('alt')) return 'alta';
  if (lower.startsWith('baix')) return 'baixa';
  return 'media';
}

export function AnalysisResults({ result, onReset }: Props) {
  const verdictRating = result.veredito.rating.toLowerCase();
  let verdictColor = 'text-ink-200';
  let verdictBg = 'from-ink-800 to-ink-900';
  let verdictBorder = 'border-ink-700';

  if (verdictRating.includes('favor') && !verdictRating.includes('des')) {
    verdictColor = 'text-success-300';
    verdictBg = 'from-success-600/20 to-success-800/20';
    verdictBorder = 'border-success-500/30';
  } else if (verdictRating.includes('desfavor') || verdictRating.includes('elevad') || verdictRating.includes('risco')) {
    verdictColor = 'text-danger-300';
    verdictBg = 'from-danger-600/20 to-danger-800/20';
    verdictBorder = 'border-danger-500/30';
  } else if (verdictRating.includes('cautel') || verdictRating.includes('atenc')) {
    verdictColor = 'text-warning-300';
    verdictBg = 'from-warning-600/20 to-warning-800/20';
    verdictBorder = 'border-warning-500/30';
  }

  function handleDownload() {
    const content = `ANÁLISE DE CONTRATO\n\n=== RESUMO EXECUTIVO ===\n${result.resumoExecutivo}\n\n=== PONTOS DE ATENÇÃO ===\n${result.pontosAtencao
      .map((p, i) => `${i + 1}. [${normalizeSeverity(p.severity).toUpperCase()}] ${p.title}\n   ${p.description}`)
      .join('\n\n')}\n\n=== VEREDITO ===\nClassificação: ${result.veredito.rating}\n${result.veredito.explanation}\n\n---\nAnálise gerada por IA (Google Gemini 2.5 Flash). Não substitui consulta jurídica profissional.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-contrato-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-slide-up">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900/60 px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:border-ink-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova Análise
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900/60 px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:border-ink-700 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Baixar
        </button>
      </div>

      {/* Resumo Executivo */}
      <section className="mb-6 rounded-2xl border border-ink-800 bg-ink-900/50 p-6 sm:p-8 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <FileText className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Resumo Executivo</h2>
            <p className="text-xs text-ink-400">Visão geral do contrato</p>
          </div>
        </div>
        <p className="font-serif text-base sm:text-lg leading-relaxed text-ink-200">
          {result.resumoExecutivo}
        </p>
      </section>

      {/* Pontos de Atenção */}
      <section className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10">
            <AlertTriangle className="h-5 w-5 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pontos de Atenção</h2>
            <p className="text-xs text-ink-400">Riscos jurídicos identificados</p>
          </div>
        </div>
        <div className="grid gap-4">
          {result.pontosAtencao.map((point, i) => {
            const sev = normalizeSeverity(point.severity);
            const config = severityConfig[sev];
            return (
              <div
                key={i}
                className={`rounded-xl border ${config.classes} p-5 sm:p-6 transition-transform hover:scale-[1.01]`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-ink-200">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-white">{point.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.dot}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-300 leading-relaxed">{point.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Veredito */}
      <section className={`rounded-2xl border ${verdictBorder} bg-gradient-to-br ${verdictBg} p-6 sm:p-8 shadow-xl`}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950/40">
            <Gavel className="h-5 w-5 text-ink-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Veredito</h2>
            <p className="text-xs text-ink-400">Classificação final</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className={`h-6 w-6 ${verdictColor}`} />
          <span className={`text-xl sm:text-2xl font-semibold ${verdictColor}`}>{result.veredito.rating}</span>
        </div>
        <p className="font-serif text-base leading-relaxed text-ink-200">{result.veredito.explanation}</p>
      </section>

      {/* Disclaimer */}
      <div className="mt-8 rounded-xl border border-ink-800/60 bg-ink-900/30 p-4">
        <p className="text-center text-xs text-ink-500 leading-relaxed">
          Esta análise foi gerada por inteligência artificial (Google Gemini 2.5 Flash) e não constitui parecer jurídico.
          Para decisões importantes, consulte sempre um advogado qualificado.
        </p>
      </div>
    </div>
  );
}

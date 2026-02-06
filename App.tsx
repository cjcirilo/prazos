
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Calendar, AlertCircle, ChevronRight, Info, ShieldCheck, 
  RotateCcw, RefreshCcw, Printer, Mail, X, History, MapPin, Loader2, Search, ChevronDown
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RegraPrazo, Instancia, Sistema, TipoProcesso, DeadlineParams, CalculationResult, CustomHoliday 
} from './types';
import { TRIBUNAIS } from './constants';
import { calculateDeadline } from './services/deadlineService';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const STORAGE_KEY = 'calculadora-pro-v2-settings';

const App: React.FC = () => {
  const [params, setParams] = useState<DeadlineParams>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultParams: DeadlineParams = {
      dias: 15,
      regra: RegraPrazo.NOVO_CPC,
      dataEvento: format(new Date(), 'yyyy-MM-dd'),
      tribunal: 'TJSP',
      tipo: TipoProcesso.ELETRONICO,
      sistema: Sistema.ESAJ,
      instancia: Instancia.PRIMEIRA,
      estado: 'SP',
      cidade: 'São Paulo',
      holidayConfig: { nacionais: true, estaduais: true, municipais: false },
      customHolidays: []
    };
    if (saved) try { return { ...defaultParams, ...JSON.parse(saved) }; } catch (e) { return defaultParams; }
    return defaultParams;
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  
  // Estados IBGE
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  
  // Estados de Busca
  const [ufSearch, setUfSearch] = useState(params.estado);
  const [showUfDropdown, setShowUfDropdown] = useState(false);
  const [cidadeSearch, setCidadeSearch] = useState(params.cidade);
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false);

  const ufRef = useRef<HTMLDivElement>(null);
  const cidadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(setUfs);

    const handleClickOutside = (event: MouseEvent) => {
      if (ufRef.current && !ufRef.current.contains(event.target as Node)) setShowUfDropdown(false);
      if (cidadeRef.current && !cidadeRef.current.contains(event.target as Node)) setShowCidadeDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (params.estado) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${params.estado}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => setCidades(data.map((c: any) => c.nome)));
    } else {
      setCidades([]);
    }
  }, [params.estado]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const loadMunicipalHolidays = async (cidade: string, estado: string) => {
    if (!params.holidayConfig.municipais || !cidade) return;
    setLoadingHolidays(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const year = new Date().getFullYear();
      const prompt = `Liste os feriados municipais fixos e móveis (incluindo padroeiros e aniversários da cidade) para a cidade de ${cidade}, ${estado} no ano de ${year}. Retorne APENAS um array JSON de objetos com as propriedades "data" (formato MM-dd) e "nome".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                data: { type: Type.STRING },
                nome: { type: Type.STRING }
              },
              required: ["data", "nome"]
            }
          }
        }
      });
      
      const feriados: CustomHoliday[] = JSON.parse(response.text);
      setParams(prev => ({ ...prev, customHolidays: feriados }));
    } catch (error) {
      console.error("Erro ao carregar feriados municipais:", error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    if (params.holidayConfig.municipais && params.cidade) {
      loadMunicipalHolidays(params.cidade, params.estado);
    } else {
      setParams(prev => ({ ...prev, customHolidays: [] }));
    }
  }, [params.cidade, params.holidayConfig.municipais]);

  const handleSimulate = () => {
    const res = calculateDeadline(params);
    setResult(res);
    setShowReport(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetSimulation = () => {
    setResult(null);
    setShowReport(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleHoliday = (type: keyof typeof params.holidayConfig) => {
    setParams({
      ...params,
      holidayConfig: { ...params.holidayConfig, [type]: !params.holidayConfig[type] }
    });
  };

  const filteredUfs = ufs.filter(uf => 
    uf.sigla.toLowerCase().includes(ufSearch.toLowerCase()) || 
    uf.nome.toLowerCase().includes(ufSearch.toLowerCase())
  );

  const filteredCidades = cidades.filter(c => 
    c.toLowerCase().includes(cidadeSearch.toLowerCase())
  );

  if (showReport && result) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 pb-24 text-slate-900">
        <main className="w-full max-w-3xl space-y-12">
          <div className="flex justify-center border-b border-slate-100 pb-8">
             <button onClick={resetSimulation} className="flex flex-col items-center gap-2 group">
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <RotateCcw className="w-6 h-6 text-black" />
                </div>
                <span className="text-sm font-semibold text-black">Simular novo prazo</span>
             </button>
          </div>

          <div className="text-center px-4">
             <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
                Resultado para: <strong className="text-black">{params.dias} dias</strong> no <strong className="text-black">{params.regra}</strong>. 
                Feriados aplicados: {params.holidayConfig.nacionais ? 'Nacionais, ' : ''} {params.holidayConfig.estaduais ? 'Estaduais, ' : ''} {params.holidayConfig.municipais ? `Municipais (${params.cidade})` : ''}.
             </p>
          </div>

          <div className="text-center py-4">
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                {format(result.dataFinal, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
             </h2>
          </div>

          {result.feriadosEncontrados.length > 0 && (
            <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100">
               <h3 className="text-base font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                 <div className="bg-black p-2 rounded-lg">
                    <History className="w-4 h-4 text-white" />
                 </div>
                 Impactos Detectados
               </h3>
               <div className="space-y-4">
                 {result.feriadosEncontrados.map((f, i) => (
                   <div key={i} className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:scale-[1.01]">
                     <div className="flex flex-col items-center justify-center bg-slate-900 text-white px-5 py-4 rounded-2xl min-w-[100px] shadow-lg shadow-slate-200">
                        <span className="text-[11px] uppercase font-black text-slate-400 mb-1 leading-none">
                          {format(f.date, 'MMM', { locale: ptBR }).replace('.', '')}
                        </span>
                        <span className="text-3xl font-black tracking-tighter leading-none">
                          {format(f.date, 'dd')}
                        </span>
                        <span className="text-[10px] uppercase font-black text-slate-500 mt-1 leading-none">
                          {format(f.date, 'yyyy')}
                        </span>
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                       <div className="flex items-center gap-2 mb-1">
                         <Calendar className="w-3 h-3 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           {format(f.date, 'eeee', { locale: ptBR })}
                         </span>
                       </div>
                       <h4 className="text-xl font-extrabold text-slate-900 leading-tight">
                         {f.name}
                       </h4>
                     </div>
                     <div className="flex items-center">
                        <div className="w-full sm:w-auto px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] bg-slate-900 text-white border border-slate-800 shadow-lg shadow-slate-200 text-center whitespace-nowrap">
                          {f.impacto}
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-10">
             <h3 className="text-xl font-bold text-center mb-8 text-slate-500 uppercase tracking-widest">Memória de Cálculo</h3>
             <div className="space-y-3">
                {result.simulationLog.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm md:text-base">
                    {day.isCounted ? (
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-[#22c55e] text-white flex items-center justify-center rounded-lg font-bold text-sm">
                        {day.countNumber}
                      </div>
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-[#ef4444] text-white flex items-center justify-center rounded-lg font-bold">
                        <X className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-medium text-slate-600">{format(day.date, 'dd/MM/yyyy')}</span>
                      <span className="text-slate-400">-</span>
                      <span className={`font-semibold ${day.description.includes('Recesso') || day.description.includes('Feriado') ? 'text-black font-black' : 'text-slate-800'}`}>
                        {day.description}
                      </span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 pb-24 text-slate-900">
      <header className="mb-10 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-slate-900 p-3 rounded-xl shadow-lg shadow-slate-200">
            <Calculator className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Calculadora <span className="text-black font-extrabold">Pro</span>
          </h1>
        </div>
        <p className="text-slate-500 font-medium text-lg">
          Inteligência Jurídica em Prazos: Novo CPC, CLT, CPP e Todos os Municípios.
        </p>
      </header>

      <main className="w-full max-w-3xl space-y-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Prazo em dias</label>
              <input 
                type="number"
                value={params.dias}
                onChange={(e) => setParams({...params, dias: parseInt(e.target.value) || 0})}
                className="w-full text-xl font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Regra de Contagem</label>
              <select 
                value={params.regra}
                onChange={(e) => setParams({...params, regra: e.target.value as RegraPrazo})}
                className="w-full text-lg font-semibold border-b-2 border-slate-100 focus:border-black outline-none py-2 bg-transparent"
              >
                {Object.values(RegraPrazo).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Data do Evento</label>
              <input 
                type="date"
                value={params.dataEvento}
                onChange={(e) => setParams({...params, dataEvento: e.target.value})}
                className="w-full text-lg font-semibold border-b-2 border-slate-100 focus:border-black outline-none py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Tribunal</label>
              <select 
                value={params.tribunal}
                onChange={(e) => setParams({...params, tribunal: e.target.value})}
                className="w-full text-lg font-semibold border-b-2 border-slate-100 focus:border-black outline-none py-2 bg-transparent"
              >
                {TRIBUNAIS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Sistema / Instância</label>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={params.sistema}
                  onChange={(e) => setParams({...params, sistema: e.target.value as Sistema})}
                  className="w-full font-semibold border-b border-slate-100 focus:border-black outline-none py-2 bg-transparent"
                >
                  {Object.values(Sistema).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                  value={params.instancia}
                  onChange={(e) => setParams({...params, instancia: e.target.value as Instancia})}
                  className="w-full font-semibold border-b border-slate-100 focus:border-black outline-none py-2 bg-transparent"
                >
                  {Object.values(Instancia).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Localização do Processo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Busca de UF */}
                <div className="relative" ref={ufRef}>
                  <div 
                    onClick={() => setShowUfDropdown(!showUfDropdown)}
                    className="flex items-center justify-between border-b border-slate-100 py-2 cursor-pointer group"
                  >
                    <span className="font-bold text-lg">{params.estado || 'UF'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                  </div>
                  {showUfDropdown && (
                    <div className="absolute top-full left-0 z-50 w-48 mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                      <div className="p-2 border-b border-slate-50 bg-slate-50 flex items-center gap-2">
                        <Search className="w-3 h-3 text-slate-400" />
                        <input 
                          autoFocus
                          placeholder="Buscar UF..."
                          value={ufSearch}
                          onChange={(e) => setUfSearch(e.target.value)}
                          className="bg-transparent outline-none text-xs font-semibold w-full"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredUfs.map(uf => (
                          <div 
                            key={uf.sigla}
                            onClick={() => {
                              setParams({...params, estado: uf.sigla, cidade: ''});
                              setUfSearch(uf.sigla);
                              setCidadeSearch('');
                              setShowUfDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm flex items-center justify-between"
                          >
                            <span className="font-bold">{uf.sigla}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase">{uf.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Busca de Cidade */}
                <div className="col-span-2 relative" ref={cidadeRef}>
                  <div 
                    onClick={() => params.estado && setShowCidadeDropdown(!showCidadeDropdown)}
                    className={`flex items-center justify-between border-b border-slate-100 py-2 cursor-pointer group ${!params.estado && 'opacity-30 cursor-not-allowed'}`}
                  >
                    <span className="font-bold truncate text-lg pr-4">{params.cidade || 'Cidade'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                  </div>
                  {showCidadeDropdown && (
                    <div className="absolute top-full right-0 z-50 w-64 mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                      <div className="p-2 border-b border-slate-50 bg-slate-50 flex items-center gap-2">
                        <Search className="w-3 h-3 text-slate-400" />
                        <input 
                          autoFocus
                          placeholder="Buscar Cidade..."
                          value={cidadeSearch}
                          onChange={(e) => setCidadeSearch(e.target.value)}
                          className="bg-transparent outline-none text-xs font-semibold w-full"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCidades.length > 0 ? filteredCidades.map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              setParams({...params, cidade: c});
                              setCidadeSearch(c);
                              setShowCidadeDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-700"
                          >
                            {c}
                          </div>
                        )) : (
                          <div className="p-4 text-center text-xs text-slate-400 italic">Nenhuma cidade encontrada</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Configuração de Calendário
                </span>
                {loadingHolidays && (
                  <span className="text-[10px] flex items-center gap-1 text-slate-500 animate-pulse font-bold">
                    <Loader2 className="w-3 h-3 animate-spin" /> Carregando feriados de {params.cidade}...
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={params.holidayConfig.nacionais} onChange={() => toggleHoliday('nacionais')} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium">Nacionais</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={params.holidayConfig.estaduais} onChange={() => toggleHoliday('estaduais')} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium">Estaduais / Judiciários</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={params.holidayConfig.municipais} onChange={() => toggleHoliday('municipais')} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium">Municipais ({params.cidade})</span>
                </label>
              </div>
              {params.holidayConfig.municipais && params.customHolidays && params.customHolidays.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Feriados detectados para {params.cidade}:</p>
                  <div className="flex flex-wrap gap-2">
                    {params.customHolidays.map((h, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                        {h.data} - {h.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleSimulate}
              disabled={loadingHolidays}
              className="group bg-slate-900 hover:bg-black text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
            >
              {loadingHolidays ? 'Processando Calendário...' : 'Simular Prazo'}
              {!loadingHolidays && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

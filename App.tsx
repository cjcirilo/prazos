
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Calendar, AlertCircle, ChevronRight, Info, ShieldCheck, 
  RotateCcw, RefreshCcw, Printer, Mail, X, History, MapPin, Loader2, Search, ChevronDown, Clock, Star,
  CheckCircle2, AlertTriangle, Timer
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RegraPrazo, Instancia, Sistema, TipoProcesso, DeadlineParams, CalculationResult, CustomHoliday, UnidadeContagem,
  Disponibilizacao, TipoComunicacao, TipoPessoa, Confirmacao
} from './types';
import { TRIBUNAIS } from './constants';
import { calculateDeadline } from './services/deadlineService';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const STORAGE_KEY = 'calculadora-pro-v7-settings';

const App: React.FC = () => {
  const [params, setParams] = useState<DeadlineParams>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultParams: DeadlineParams = {
      dias: 15,
      unidade: UnidadeContagem.DIAS_UTEIS,
      regra: RegraPrazo.NOVO_CPC,
      dataEvento: format(new Date(), 'yyyy-MM-dd'),
      horaEvento: '09:00',
      disponibilizacao: Disponibilizacao.DJE,
      tipoComunicacao: TipoComunicacao.PUBLICACAO_PADRAO,
      destinatario: TipoPessoa.FISICA,
      statusConfirmacao: Confirmacao.CONFIRMADA,
      dataConfirmacao: format(new Date(), 'yyyy-MM-dd'),
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
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const [ufs, setUfs] = useState<{sigla: string, nome: string}[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [sugestoesCidades, setSugestoesCidades] = useState<string[]>([]);
  
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
      loadCitySuggestions(params.estado);
    } else {
      setCidades([]);
      setSugestoesCidades([]);
    }
  }, [params.estado]);

  const loadCitySuggestions = async (uf: string) => {
    setLoadingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Liste as 6 principais cidades do estado de ${uf}. Retorne APENAS um array JSON de strings.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
      });
      setSugestoesCidades(JSON.parse(response.text));
    } catch (error) { console.error(error); } finally { setLoadingSuggestions(false); }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const loadMunicipalHolidays = async (cidade: string, estado: string) => {
    if (!params.holidayConfig.municipais || !cidade) return;
    setLoadingHolidays(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const year = new Date().getFullYear();
      const prompt = `Feriados municipais em ${cidade}, ${estado} em ${year}. JSON: [{data: MM-dd, nome: string}].`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      setParams(prev => ({ ...prev, customHolidays: JSON.parse(response.text) }));
    } catch (error) { console.error(error); } finally { setLoadingHolidays(false); }
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

  const filteredUfs = ufs.filter(uf => uf.sigla.toLowerCase().includes(ufSearch.toLowerCase()) || uf.nome.toLowerCase().includes(ufSearch.toLowerCase()));
  const filteredCidades = cidades.filter(c => c.toLowerCase().includes(cidadeSearch.toLowerCase()));

  if (showReport && result) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 pb-24 text-slate-900">
        <main className="w-full max-w-3xl space-y-12">
          <div className="flex justify-center">
             <button onClick={() => {setResult(null); setShowReport(false);}} className="flex flex-col items-center gap-2 group">
                <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-slate-100 transition-all group-active:scale-95 shadow-sm border border-slate-100">
                  <RotateCcw className="w-6 h-6 text-slate-900" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Nova Simulação</span>
             </button>
          </div>

          {result.aviso && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-start gap-5 shadow-sm">
               <div className="bg-amber-100 p-2.5 rounded-xl"><AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" /></div>
               <div>
                  <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-[0.2em] mb-1">Status do Processo</h4>
                  <p className="text-amber-800 font-bold leading-tight">{result.aviso}</p>
               </div>
            </div>
          )}

          {/* CABEÇALHO DE RESULTADO PROEMINENTE */}
          <div className="flex flex-col items-center text-center space-y-8">
             <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-200">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Prazo Final Determinado</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 w-full">
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                  {format(result.dataFinal, "d 'de' MMMM", { locale: ptBR })}
               </h2>
               
               <div className="flex flex-col items-center gap-2">
                 {result.isHora ? (
                    <div className="flex items-center gap-4 bg-red-600 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl shadow-red-200 border-4 border-red-500 transform hover:scale-105 transition-transform">
                      <Clock className="w-10 h-10 md:w-12 md:h-12" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-red-100 mb-1">Vence às</span>
                        <span className="text-5xl md:text-6xl font-black tracking-tighter">
                          {format(result.dataFinal, "HH:mm")}
                        </span>
                      </div>
                    </div>
                 ) : null}
                 <span className="text-2xl font-black text-slate-300 tracking-[0.4em] uppercase mt-2">
                   {format(result.dataFinal, "yyyy")}
                 </span>
               </div>
             </div>

             <div className="max-w-xl mx-auto p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
               <p className="text-slate-500 font-bold text-base md:text-lg leading-relaxed italic">
                 "{result.explicação}"
               </p>
             </div>
          </div>

          {result.feriadosEncontrados.length > 0 && (
            <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-inner">
               <h3 className="text-xs font-black text-slate-400 mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
                 <div className="bg-slate-900 p-2 rounded-lg"><History className="w-4 h-4 text-white" /></div>
                 Eventos que Impactaram o Prazo
               </h3>
               <div className="space-y-5">
                 {result.feriadosEncontrados.map((f, i) => (
                   <div key={i} className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                     <div className="flex flex-col items-center justify-center bg-slate-900 text-white px-5 py-4 rounded-2xl min-w-[100px] shadow-lg shadow-slate-200">
                        <span className="text-[10px] uppercase font-black text-slate-400 mb-1 leading-none">{format(f.date, 'MMM', { locale: ptBR }).replace('.', '')}</span>
                        <span className="text-3xl font-black tracking-tighter leading-none">{format(f.date, 'dd')}</span>
                     </div>
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1.5">
                         <Calendar className="w-3.5 h-3.5 text-slate-300" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(f.date, 'eeee', { locale: ptBR })}</span>
                       </div>
                       <h4 className="text-xl font-black text-slate-900 leading-tight">{f.name}</h4>
                     </div>
                     <div className="flex items-center">
                        <div className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 border border-red-100 text-center whitespace-nowrap">{f.impacto}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div className="pt-8 px-4">
             <div className="flex items-center gap-4 mb-10">
               <div className="h-px bg-slate-100 flex-1"></div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Cronograma Passo a Passo</h3>
               <div className="h-px bg-slate-100 flex-1"></div>
             </div>
             <div className="space-y-6">
                {result.simulationLog.map((day, idx) => {
                  const isTacito = day.description.toLowerCase().includes('tácita') || day.description.toLowerCase().includes('pós confirmação');
                  const isHoliday = day.description.toLowerCase().includes('feriado') || day.description.toLowerCase().includes('recesso');
                  
                  return (
                    <div key={idx} className="flex items-start gap-6 group">
                      <div className="shrink-0 mt-1">
                        {day.isCounted ? (
                          <div className="w-12 h-12 bg-green-500 text-white flex items-center justify-center rounded-2xl font-black text-lg shadow-lg shadow-green-100 border-2 border-green-400">{day.countNumber}</div>
                        ) : (
                          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black shadow-sm border-2 transition-colors ${
                            isTacito ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                            isHoliday ? 'bg-red-50 text-red-500 border-red-100' :
                            'bg-slate-50 text-slate-300 border-slate-100'
                          }`}>
                            {isTacito ? <Timer className="w-7 h-7 animate-pulse" /> : <X className="w-7 h-7" />}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col pt-1.5 border-b border-slate-50 pb-5 w-full">
                         <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(day.date, 'dd/MM/yyyy')}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(day.date, 'eeee', { locale: ptBR })}</span>
                         </div>
                         <span className={`text-xl font-bold tracking-tight ${
                           day.isCounted ? 'text-slate-900' : 
                           isTacito ? 'text-amber-700' : 
                           isHoliday ? 'text-red-700 font-black' :
                           'text-slate-400 line-through decoration-slate-200'
                         }`}>
                           {day.description}
                         </span>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 pb-24 text-slate-900">
      <header className="mb-12 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-slate-900 p-3.5 rounded-[1.2rem] shadow-2xl shadow-slate-200"><Calculator className="text-white w-8 h-8" /></div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Calculadora <span className="text-slate-400">Pro</span></h1>
        </div>
        <p className="text-slate-500 font-semibold text-xl leading-relaxed">Gestão Inteligente de Prazos DJE, DJEN e Citações Eletrônicas.</p>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-14 transition-all">
          
          {/* Seção 1: Comunicação e Citação */}
          <div className="mb-12 pb-12 border-b border-slate-100">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-900" /> Origem da Comunicação
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Disponibilização no</label>
                  <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {Object.values(Disponibilizacao).map(d => (
                      <button key={d} onClick={() => setParams({...params, disponibilizacao: d})} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${params.disponibilizacao === d ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipo de Comunicação</label>
                  <select value={params.tipoComunicacao} onChange={(e) => setParams({...params, tipoComunicacao: e.target.value as TipoComunicacao})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent cursor-pointer">
                    {Object.values(TipoComunicacao).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Data da Publicação</label>
                  <input type="date" value={params.dataEvento} onChange={(e) => setParams({...params, dataEvento: e.target.value})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent" />
                </div>

                {(params.tipoComunicacao === TipoComunicacao.CITACAO_ELETRONICA || params.tipoComunicacao === TipoComunicacao.INTIMACAO_PESSOAL) && (
                  <>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Destinatário</label>
                      <select value={params.destinatario} onChange={(e) => setParams({...params, destinatario: e.target.value as TipoPessoa})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent cursor-pointer">
                        {Object.values(TipoPessoa).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status da Leitura</label>
                      <select value={params.statusConfirmacao} onChange={(e) => setParams({...params, statusConfirmacao: e.target.value as Confirmacao})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent cursor-pointer">
                        {Object.values(Confirmacao).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {params.statusConfirmacao === Confirmacao.CONFIRMADA && (
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Data de Confirmação</label>
                        <input type="date" value={params.dataConfirmacao} onChange={(e) => setParams({...params, dataConfirmacao: e.target.value})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent" />
                      </div>
                    )}
                  </>
                )}
             </div>
          </div>

          {/* Seção 2: Regras e Prazo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="md:col-span-2 lg:col-span-3 space-y-5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Quantidade do Prazo</label>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <input type="number" value={params.dias} onChange={(e) => setParams({...params, dias: parseInt(e.target.value) || 0})} className="w-full md:w-40 text-6xl font-black border-b-4 border-slate-100 focus:border-black outline-none py-2 bg-transparent transition-colors" />
                <div className="flex flex-wrap gap-2 w-full">
                  {Object.values(UnidadeContagem).map((u) => (
                    <button key={u} onClick={() => setParams({...params, unidade: u})} className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${params.unidade === u ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-300' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Regra Normativa</label>
              <select value={params.regra} onChange={(e) => setParams({...params, regra: e.target.value as RegraPrazo})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent cursor-pointer">
                {Object.values(RegraPrazo).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tribunal / Instância</label>
              <select value={params.tribunal} onChange={(e) => setParams({...params, tribunal: e.target.value})} className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-black outline-none py-2.5 bg-transparent cursor-pointer">
                {TRIBUNAIS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-3 relative">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Estado / UF</label>
              <div ref={ufRef} className="relative">
                <div onClick={() => setShowUfDropdown(!showUfDropdown)} className="flex items-center justify-between border-b-2 border-slate-100 py-2.5 cursor-pointer group hover:border-slate-300 transition-colors">
                  <span className="font-bold text-lg">{params.estado || 'Selecionar'}</span>
                  <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-black transition-transform duration-300" style={{ transform: showUfDropdown ? 'rotate(180deg)' : 'none' }} />
                </div>
                {showUfDropdown && (
                  <div className="absolute top-full left-0 z-50 w-full mt-3 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 flex items-center gap-3 border-b border-slate-100"><Search className="w-4 h-4 text-slate-400" /><input autoFocus placeholder="Filtrar UF..." value={ufSearch} onChange={(e) => setUfSearch(e.target.value)} className="bg-transparent outline-none text-sm font-black w-full" /></div>
                    <div className="max-h-60 overflow-y-auto">{filteredUfs.map(uf => (<div key={uf.sigla} onClick={() => {setParams({...params, estado: uf.sigla, cidade: ''}); setUfSearch(uf.sigla); setShowUfDropdown(false);}} className="px-6 py-4 hover:bg-slate-50 cursor-pointer text-sm flex items-center justify-between border-b border-slate-50 last:border-none transition-colors"><span className="font-black text-slate-800">{uf.sigla}</span><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{uf.nome}</span></div>))}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 relative">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Comarca / Cidade</label>
              <div ref={cidadeRef} className="relative">
                <div onClick={() => params.estado && setShowCidadeDropdown(!showCidadeDropdown)} className={`flex items-center justify-between border-b-2 border-slate-100 py-2.5 cursor-pointer group hover:border-slate-300 transition-colors ${!params.estado && 'opacity-30 cursor-not-allowed'}`}>
                  <span className="font-bold truncate text-lg pr-4">{params.cidade || 'Selecionar'}</span>
                  <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-black transition-transform duration-300" style={{ transform: showCidadeDropdown ? 'rotate(180deg)' : 'none' }} />
                </div>
                {showCidadeDropdown && (
                  <div className="absolute top-full right-0 z-50 w-80 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 flex items-center gap-3 border-b border-slate-100"><Search className="w-4 h-4 text-slate-400" /><input autoFocus placeholder="Buscar Comarca..." value={cidadeSearch} onChange={(e) => setCidadeSearch(e.target.value)} className="bg-transparent outline-none text-sm font-black w-full" /></div>
                    <div className="max-h-80 overflow-y-auto">
                      {!cidadeSearch && (sugestoesCidades.length > 0 || loadingSuggestions) && (
                        <div className="p-3 bg-slate-50/50">
                          <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Sugestões Inteligentes</p>
                          {loadingSuggestions ? <div className="px-6 py-4 text-xs text-slate-400 italic flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analisando polos...</div> : (
                            <div className="grid grid-cols-1 gap-1">{sugestoesCidades.map(c => (<button key={c} onClick={() => {setParams({...params, cidade: c}); setCidadeSearch(c); setShowCidadeDropdown(false);}} className="px-5 py-3 text-left text-sm font-bold text-slate-800 hover:bg-white hover:shadow-md rounded-2xl transition-all">{c}</button>))}</div>
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Lista Geral IBGE</p>
                        {filteredCidades.map(c => (<div key={c} onClick={() => {setParams({...params, cidade: c}); setCidadeSearch(c); setShowCidadeDropdown(false);}} className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 rounded-2xl transition-colors">{c}</div>))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 p-10 bg-slate-900 rounded-[2.5rem] space-y-8 shadow-2xl shadow-slate-200 border border-slate-800">
               <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4"><ShieldCheck className="w-6 h-6 text-white" /> Configurações de Calendário</span>
                  {loadingHolidays && <span className="text-[10px] font-black text-slate-400 animate-pulse uppercase tracking-widest flex items-center gap-3"><Loader2 className="w-4 h-4 animate-spin" /> Sincronizando Base {params.cidade}...</span>}
               </div>
               <div className="flex flex-wrap gap-10">
                  {['nacionais', 'estaduais', 'municipais'].map((key) => (
                    <label key={key} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" checked={(params.holidayConfig as any)[key]} onChange={() => setParams({...params, holidayConfig: {...params.holidayConfig, [key]: !(params.holidayConfig as any)[key]}})} className="sr-only peer" />
                        <div className="w-14 h-7 bg-slate-800 rounded-full peer-checked:bg-white transition-all shadow-inner"></div>
                        <div className="absolute left-1.5 top-1.5 w-4 h-4 bg-slate-600 rounded-full peer-checked:translate-x-7 peer-checked:bg-black transition-all"></div>
                      </div>
                      <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{key}</span>
                    </label>
                  ))}
               </div>
            </div>
          </div>

          <div className="mt-20 flex justify-center">
            <button onClick={handleSimulate} disabled={loadingHolidays} className="group bg-slate-900 hover:bg-black text-white font-black py-7 px-24 rounded-[2rem] transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 flex items-center gap-5 text-xl active:scale-95">
              {loadingHolidays ? 'Validando...' : (
                <>
                  {params.unidade === UnidadeContagem.HORAS ? <Timer className="w-7 h-7" /> : <Calculator className="w-7 h-7" />}
                  Simular Prazo
                  <ChevronRight className="w-7 h-7 group-hover:translate-x-3 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

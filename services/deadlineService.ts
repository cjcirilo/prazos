
import { addDays, addHours, format, isSaturday, isSunday, differenceInCalendarDays, parse } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { 
  RegraPrazo, DeadlineParams, CalculationResult, DetectedHoliday, 
  SimulationDay, UnidadeContagem, TipoComunicacao, Confirmacao, TipoPessoa, Disponibilizacao 
} from '../types';
import { FERIADOS_NACIONAIS, FERIADOS_TRIBUNAIS, SUSPENSOES_PONTUAIS } from '../constants';

const parseISO = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const parseISOWithTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const calculateDeadline = (params: DeadlineParams): CalculationResult => {
  const { 
    dias, regra, dataEvento, horaEvento, holidayConfig, tribunal, 
    customHolidays, unidade, tipoComunicacao, statusConfirmacao, 
    destinatario, dataConfirmacao, disponibilizacao 
  } = params;

  const eventDate = parseISOWithTime(dataEvento, horaEvento);
  const feriadosEncontrados: DetectedHoliday[] = [];
  const simulationLog: SimulationDay[] = [];
  let aviso: string | undefined;

  const addDetectedHoliday = (date: Date, name: string, impacto: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!feriadosEncontrados.some(f => format(f.date, 'yyyy-MM-dd') === dateStr)) {
      feriadosEncontrados.push({ date: new Date(date), name, impacto });
    }
  };

  const isHoliday = (date: Date): string | null => {
    const dStr = format(date, 'MM-dd');
    const fullDateStr = format(date, 'yyyy-MM-dd');
    const month = date.getMonth();
    const day = date.getDate();
    
    if (tribunal === 'STF' || tribunal === 'STJ') {
      if (month === 6 && day >= 2 && day <= 31) return `Recesso Forense ${tribunal} (Julho)`;
      if ((month === 11 && day >= 20) || (month === 0 && day <= 31)) return `Recesso Forense ${tribunal} (Final de Ano)`;
    } else {
      if ((month === 11 && day >= 20) || (month === 0 && day <= 20)) return 'Recesso Forense (Art. 220 CPC)';
    }

    if (holidayConfig.nacionais) {
      const feriado = FERIADOS_NACIONAIS.find(f => f.data === dStr);
      if (feriado) return feriado.nome;
    }

    if (holidayConfig.estaduais) {
      const feriadosTribunal = FERIADOS_TRIBUNAIS[tribunal] || [];
      const feriadoEspecial = feriadosTribunal.find(f => f.data === dStr);
      if (feriadoEspecial) return feriadoEspecial.nome;
    }

    if (holidayConfig.municipais && customHolidays) {
      const municipal = customHolidays.find(f => f.data === dStr);
      if (municipal) return `${municipal.nome} (${params.cidade})`;
    }

    const suspensoesTribunal = SUSPENSOES_PONTUAIS[tribunal] || [];
    const suspensao = suspensoesTribunal.find(s => s.data === fullDateStr);
    if (suspensao) return suspensao.nome;

    if (dStr === '12-08') return 'Dia da Justiça';

    return null;
  };

  const isWorkDay = (date: Date): { work: boolean; reason: string | null } => {
    if (isSaturday(date)) return { work: false, reason: 'Final de Semana' };
    if (isSunday(date)) return { work: false, reason: 'Final de Semana' };
    const h = isHoliday(date);
    if (h) return { work: false, reason: h };
    return { work: true, reason: null };
  };

  // --- LÓGICA DE DEFINIÇÃO DO INÍCIO (DIES A QUO) ---
  let startDate = startOfDay(eventDate);
  let explanation = '';

  if (tipoComunicacao === TipoComunicacao.CITACAO_ELETRONICA) {
    if (statusConfirmacao === Confirmacao.CONFIRMADA) {
      explanation = 'Citação Eletrônica Confirmada: Início no 5º dia útil após confirmação.';
      let confDate = parseISO(dataConfirmacao);
      simulationLog.push({ date: confDate, isCounted: false, description: 'Data da Confirmação' });
      
      let businessDaysFound = 0;
      let checkDate = addDays(confDate, 1);
      while (businessDaysFound < 5) {
        const { work, reason } = isWorkDay(checkDate);
        if (work) {
          businessDaysFound++;
          simulationLog.push({ date: checkDate, isCounted: false, description: `${businessDaysFound}º dia útil pós confirmação` });
        } else {
          simulationLog.push({ date: checkDate, isCounted: false, description: `Prorrogado (${reason || 'Não útil'})` });
        }
        if (businessDaysFound < 5) checkDate = addDays(checkDate, 1);
      }
      startDate = checkDate;
    } else {
      if (destinatario === TipoPessoa.JURIDICA_PUBLICA) {
        explanation = 'Citação Eletrônica não confirmada (PJ Público): Citação tácita após 10 dias corridos.';
        simulationLog.push({ date: eventDate, isCounted: false, description: 'Disponibilização no Sistema' });
        
        let tacitoDate = eventDate;
        for (let i = 1; i <= 10; i++) {
          tacitoDate = addDays(tacitoDate, 1);
          simulationLog.push({ 
            date: tacitoDate, 
            isCounted: false, 
            description: `${i}º dia do prazo de 10 dias para citação tácita` 
          });
        }
        startDate = tacitoDate;
      } else {
        aviso = "Citação considerada ausente. Deve ser realizada por outro meio.";
        explanation = 'Citação Eletrônica não confirmada (PF/PJ Privado): Necessária outra forma de citação.';
        startDate = eventDate;
      }
    }
  } else if (tipoComunicacao === TipoComunicacao.INTIMACAO_PESSOAL) {
    if (statusConfirmacao === Confirmacao.CONFIRMADA) {
        explanation = 'Intimação Pessoal Confirmada: Contagem a partir da consulta.';
        startDate = parseISO(dataConfirmacao);
    } else {
        explanation = 'Intimação Pessoal (Tácita): Contagem após 10 dias corridos da publicação.';
        simulationLog.push({ date: eventDate, isCounted: false, description: 'Disponibilização/Publicação' });
        
        let tacitoDate = eventDate;
        for (let i = 1; i <= 10; i++) {
          tacitoDate = addDays(tacitoDate, 1);
          simulationLog.push({ 
            date: tacitoDate, 
            isCounted: false, 
            description: `${i}º dia do prazo de 10 dias para intimação tácita` 
          });
        }
        startDate = tacitoDate;
    }
  } else {
    if (disponibilizacao === Disponibilizacao.DJEN) {
      explanation = 'Publicação DJEN: Prazo conta do 1º dia útil após publicação.';
      startDate = eventDate;
    } else {
      explanation = 'Publicação DJE: Regra padrão.';
      startDate = eventDate;
    }
  }

  const dataInicioReal = startDate;
  
  if (unidade === UnidadeContagem.HORAS) {
    let finalDateTime = addHours(dataInicioReal, dias);
    let checkDate = finalDateTime;
    while (!isWorkDay(checkDate).work) {
      const { reason } = isWorkDay(checkDate);
      if (reason && reason !== 'Final de Semana') addDetectedHoliday(checkDate, reason, 'Prorrogou o vencimento final');
      simulationLog.push({ date: checkDate, isCounted: false, description: `Prorrogado: ${reason || 'Dia não útil'}` });
      checkDate = addDays(checkDate, 1);
    }

    return {
      dataFinal: checkDate,
      dataInicioContagem: dataInicioReal,
      diasUteis: 0,
      diasCorridos: 0,
      feriadosEncontrados: feriadosEncontrados.sort((a, b) => a.date.getTime() - b.date.getTime()),
      explicação: `Prazo de ${dias} horas calculado sob ${regra}. ${explanation}`,
      simulationLog,
      isHora: true,
      aviso
    };
  }

  let currentDate = addDays(startOfDay(dataInicioReal), 1);
  let daysCounted = 0;

  // Prorrogação do Início
  while (!isWorkDay(currentDate).work) {
    const { reason } = isWorkDay(currentDate);
    if (reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Prorrogou o início');
    simulationLog.push({ date: currentDate, isCounted: false, description: `Prorrogação de Início: ${reason || 'Dia não útil'}` });
    currentDate = addDays(currentDate, 1);
  }
  
  simulationLog.push({ date: addDays(currentDate, -1), isCounted: false, description: 'Dia do Começo (dies a quo)' });

  // Contagem
  while (daysCounted < dias) {
    const { work, reason } = isWorkDay(currentDate);
    const useBusinessDays = unidade === UnidadeContagem.DIAS_UTEIS || 
                           (regra === RegraPrazo.NOVO_CPC || regra === RegraPrazo.CLT || regra === RegraPrazo.JUIZADO_ESPECIAL);

    const isActuallyBusiness = unidade === UnidadeContagem.DIAS_UTEIS ? true : (unidade === UnidadeContagem.DIAS_CORRIDOS ? false : useBusinessDays);

    if (isActuallyBusiness) {
      if (work) {
        daysCounted++;
        simulationLog.push({ date: currentDate, isCounted: true, countNumber: daysCounted, description: format(currentDate, 'eeee', { locale: ptBR }) });
      } else {
        if (reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Suspendeu a contagem');
        simulationLog.push({ date: currentDate, isCounted: false, description: reason || 'Dia não útil' });
      }
    } else {
      daysCounted++;
      simulationLog.push({ date: currentDate, isCounted: true, countNumber: daysCounted, description: format(currentDate, 'eeee', { locale: ptBR }) });
      if (!work && reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Feriado em dias corridos');
    }
    if (daysCounted < dias) currentDate = addDays(currentDate, 1);
  }

  // Prorrogação do Vencimento
  while (!isWorkDay(currentDate).work) {
    const { reason } = isWorkDay(currentDate);
    simulationLog.push({ date: currentDate, isCounted: false, description: `Prorrogação de Vencimento: ${reason || 'Dia não útil'}` });
    if (reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Prorrogou o vencimento final');
    currentDate = addDays(currentDate, 1);
  }

  const finalDate = currentDate;
  const businessDays = simulationLog.filter(l => l.isCounted).length;
  const totalCalendarDays = differenceInCalendarDays(finalDate, startOfDay(eventDate));

  return {
    dataFinal: finalDate,
    dataInicioContagem: dataInicioReal,
    diasUteis: businessDays,
    diasCorridos: totalCalendarDays,
    feriadosEncontrados: feriadosEncontrados.sort((a, b) => a.date.getTime() - b.date.getTime()),
    explicação: `Prazo de ${dias} ${unidade.toLowerCase()}. ${explanation}`,
    simulationLog,
    aviso
  };
};

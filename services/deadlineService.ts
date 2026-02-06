
import { addDays, format, isSaturday, isSunday, differenceInCalendarDays } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RegraPrazo, DeadlineParams, CalculationResult, DetectedHoliday, SimulationDay } from '../types';
import { FERIADOS_NACIONAIS, FERIADOS_TRIBUNAIS, SUSPENSOES_PONTUAIS } from '../constants';

const parseISO = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const calculateDeadline = (params: DeadlineParams): CalculationResult => {
  const { dias, regra, dataEvento, holidayConfig, tribunal, customHolidays } = params;
  const eventDate = startOfDay(parseISO(dataEvento));
  const feriadosEncontrados: DetectedHoliday[] = [];
  const simulationLog: SimulationDay[] = [];

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
    
    // 1. Tribunais Superiores (STF/STJ)
    if (tribunal === 'STF' || tribunal === 'STJ') {
      if (month === 6 && day >= 2 && day <= 31) return `Recesso Forense ${tribunal} (Julho)`;
      if ((month === 11 && day >= 20) || (month === 0 && day <= 31)) return `Recesso Forense ${tribunal} (Final de Ano)`;
    } else {
      // 2. Recesso Art. 220 CPC
      if ((month === 11 && day >= 20) || (month === 0 && day <= 20)) return 'Recesso Forense (Art. 220 CPC)';
    }

    // 3. Nacionais
    if (holidayConfig.nacionais) {
      const feriado = FERIADOS_NACIONAIS.find(f => f.data === dStr);
      if (feriado) return feriado.nome;
    }

    // 4. Estaduais/Tribunais
    if (holidayConfig.estaduais) {
      const feriadosTribunal = FERIADOS_TRIBUNAIS[tribunal] || [];
      const feriadoEspecial = feriadosTribunal.find(f => f.data === dStr);
      if (feriadoEspecial) return feriadoEspecial.nome;
    }

    // 5. Municipais (Customizados da Seleção Dinâmica)
    if (holidayConfig.municipais && customHolidays) {
      const municipal = customHolidays.find(f => f.data === dStr);
      if (municipal) return `${municipal.nome} (${params.cidade})`;
    }

    // 6. Suspensões Pontuais
    const suspensoesTribunal = SUSPENSOES_PONTUAIS[tribunal] || [];
    const suspensao = suspensoesTribunal.find(s => s.data === fullDateStr);
    if (suspensao) return suspensao.nome;

    // 7. Dia da Justiça
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

  simulationLog.push({ date: eventDate, isCounted: false, description: 'Dia do começo (Exclui-se o dia do começo)' });

  let currentDate = addDays(eventDate, 1);
  let daysCounted = 0;

  // Prorrogação do Início
  while (!isWorkDay(currentDate).work) {
    const { reason } = isWorkDay(currentDate);
    if (reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Prorrogou o início');
    simulationLog.push({ date: currentDate, isCounted: false, description: reason || 'Dia não útil' });
    currentDate = addDays(currentDate, 1);
  }
  
  // Contagem
  while (daysCounted < dias) {
    const { work, reason } = isWorkDay(currentDate);
    if (regra === RegraPrazo.NOVO_CPC || regra === RegraPrazo.CLT || regra === RegraPrazo.JUIZADO_ESPECIAL) {
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
      if (!work && reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Feriado (Contagem em dias corridos)');
    }
    if (daysCounted < dias) currentDate = addDays(currentDate, 1);
  }

  // Prorrogação do Vencimento
  while (!isWorkDay(currentDate).work) {
    const { reason } = isWorkDay(currentDate);
    simulationLog.push({ date: currentDate, isCounted: false, description: reason || 'Dia não útil' });
    if (reason && reason !== 'Final de Semana') addDetectedHoliday(currentDate, reason, 'Prorrogou o vencimento final');
    currentDate = addDays(currentDate, 1);
  }

  const finalDate = currentDate;
  const businessDays = simulationLog.filter(l => l.isCounted).length;
  const firstCountingDay = simulationLog.find(l => l.isCounted)?.date || eventDate;
  const totalCalendarDays = differenceInCalendarDays(finalDate, firstCountingDay) + 1;

  return {
    dataFinal: finalDate,
    diasUteis: businessDays,
    diasCorridos: totalCalendarDays,
    feriadosEncontrados: feriadosEncontrados.sort((a, b) => a.date.getTime() - b.date.getTime()),
    explicação: `Prazo de ${dias} dias calculado sob a regra do ${regra}.`,
    simulationLog
  };
};

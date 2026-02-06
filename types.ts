
export enum RegraPrazo {
  NOVO_CPC = 'Novo CPC',
  CPP = 'CPP',
  ANTIGA_CLT = 'Antiga CLT',
  CLT = 'CLT',
  JUIZADO_ESPECIAL = 'Juizado Especial'
}

export enum Instancia {
  PRIMEIRA = '1ª Instância',
  SEGUNDA = '2ª Instância'
}

export enum Sistema {
  ESAJ = 'eSAJ',
  EPROC = 'Eproc',
  PJE = 'PJe',
  PROJUDI = 'Projudi'
}

export enum TipoProcesso {
  ELETRONICO = 'Eletrônico',
  FISICO = 'Físico'
}

export interface HolidayConfig {
  nacionais: boolean;
  estaduais: boolean;
  municipais: boolean;
}

export interface CustomHoliday {
  data: string; // MM-dd
  nome: string;
}

export interface DetectedHoliday {
  date: Date;
  name: string;
  impacto: string;
}

export interface SimulationDay {
  date: Date;
  isCounted: boolean;
  countNumber?: number;
  description: string;
}

export interface DeadlineParams {
  dias: number;
  regra: RegraPrazo;
  dataEvento: string;
  tribunal: string;
  tipo: TipoProcesso;
  sistema: Sistema;
  instancia: Instancia;
  estado: string;
  cidade: string;
  holidayConfig: HolidayConfig;
  customHolidays?: CustomHoliday[];
}

export interface CalculationResult {
  dataFinal: Date;
  diasUteis: number;
  diasCorridos: number;
  feriadosEncontrados: DetectedHoliday[];
  explicação: string;
  simulationLog: SimulationDay[];
}

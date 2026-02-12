
export enum RegraPrazo {
  NOVO_CPC = 'Novo CPC',
  CPP = 'CPP',
  ANTIGA_CLT = 'Antiga CLT',
  CLT = 'CLT',
  JUIZADO_ESPECIAL = 'Juizado Especial'
}

export enum UnidadeContagem {
  DIAS_UTEIS = 'Dias Úteis',
  DIAS_CORRIDOS = 'Dias Corridos',
  HORAS = 'Horas'
}

export enum Disponibilizacao {
  DJE = 'DJE',
  DJEN = 'DJEN'
}

export enum TipoComunicacao {
  CITACAO_ELETRONICA = 'Citação Eletrônica',
  INTIMACAO_PESSOAL = 'Intimação Pessoal',
  PUBLICACAO_PADRAO = 'Publicação Comum'
}

export enum TipoPessoa {
  FISICA = 'Pessoa Física',
  JURIDICA_PRIVADA = 'Jurídica de Direito Privado',
  JURIDICA_PUBLICA = 'Jurídica de Direito Público'
}

export enum Confirmacao {
  CONFIRMADA = 'Confirmada',
  NAO_CONFIRMADA = 'Não Confirmada'
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
  unidade: UnidadeContagem;
  regra: RegraPrazo;
  dataEvento: string;
  horaEvento: string;
  
  // Novos campos de citação/comunicação
  disponibilizacao: Disponibilizacao;
  tipoComunicacao: TipoComunicacao;
  destinatario: TipoPessoa;
  statusConfirmacao: Confirmacao;
  dataConfirmacao: string;

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
  dataInicioContagem: Date;
  diasUteis: number;
  diasCorridos: number;
  feriadosEncontrados: DetectedHoliday[];
  explicação: string;
  simulationLog: SimulationDay[];
  isHora?: boolean;
  aviso?: string;
}


export const TRIBUNAIS = [
  // Tribunais Estaduais (27)
  'TJAC', 'TJAL', 'TJAP', 'TJAM', 'TJBA', 'TJCE', 'TJDFT', 'TJES', 'TJGO', 
  'TJMA', 'TJMT', 'TJMS', 'TJMG', 'TJPA', 'TJPB', 'TJPR', 'TJPE', 'TJPI', 
  'TJRJ', 'TJRN', 'TJRS', 'TJRO', 'TJRR', 'TJSC', 'TJSP', 'TJSE', 'TJTO',
  // Tribunais Federais (6)
  'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6',
  // Tribunais do Trabalho (24)
  'TRT1', 'TRT2', 'TRT3', 'TRT4', 'TRT5', 'TRT6', 'TRT7', 'TRT8', 'TRT9', 'TRT10',
  'TRT11', 'TRT12', 'TRT13', 'TRT14', 'TRT15', 'TRT16', 'TRT17', 'TRT18', 'TRT19', 
  'TRT20', 'TRT21', 'TRT22', 'TRT23', 'TRT24',
  // Superiores (5)
  'STF', 'STJ', 'TST', 'TSE', 'STM'
].sort();

export const FERIADOS_NACIONAIS = [
  { data: '01-01', nome: 'Confraternização Universal' },
  { data: '04-21', nome: 'Tiradentes' },
  { data: '05-01', nome: 'Dia do Trabalhador' },
  { data: '09-07', nome: 'Independência do Brasil' },
  { data: '10-12', nome: 'Nossa Senhora Aparecida' },
  { data: '11-02', nome: 'Finados' },
  { data: '11-15', nome: 'Proclamação da República' },
  { data: '11-20', nome: 'Consciência Negra' },
  { data: '12-25', nome: 'Natal' }
];

/**
 * Feriados Estaduais, Municipais das sedes e Judiciários específicos por Tribunal.
 */
export const FERIADOS_TRIBUNAIS: Record<string, { data: string; nome: string }[]> = {
  'TJAC': [{ data: '01-23', nome: 'Dia do Evangélico' }, { data: '06-15', nome: 'Aniversário do Acre' }, { data: '08-06', nome: 'Início Revolução Acreana' }, { data: '09-05', nome: 'Dia da Amazônia' }, { data: '11-17', nome: 'Tratado de Petrópolis' }],
  'TJAL': [{ data: '06-24', nome: 'São João' }, { data: '06-29', nome: 'São Pedro' }, { data: '08-27', nome: 'Nra. Sra. dos Prazeres (Maceió)' }, { data: '09-16', nome: 'Emancipação de Alagoas' }, { data: '11-30', nome: 'Dia do Evangélico' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJAP': [{ data: '02-04', nome: 'Aniv. Macapá' }, { data: '03-19', nome: 'São José' }, { data: '09-13', nome: 'Criação Território Federal' }, { data: '10-05', nome: 'Estado do Amapá' }],
  'TJAM': [{ data: '09-05', nome: 'Elevação Província Amazonas' }, { data: '10-24', nome: 'Aniv. Manaus' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJBA': [{ data: '07-02', nome: 'Independência da Bahia' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJCE': [{ data: '03-19', nome: 'Dia de São José' }, { data: '03-25', nome: 'Data Magna do Ceará' }, { data: '08-15', nome: 'Nra. Sra. Assunção (Fortaleza)' }],
  'TJDFT': [{ data: '04-21', nome: 'Aniversário de Brasília' }, { data: '11-30', nome: 'Dia do Evangélico' }],
  'TJES': [{ data: '04-12', nome: 'Nra. Sra. da Penha (Estadual)' }, { data: '05-23', nome: 'Colonização Solo Espírito-Santense' }, { data: '09-08', nome: 'Aniv. Vitória' }],
  'TJGO': [{ data: '05-24', nome: 'Nra. Sra. Auxiliadora (Goiânia)' }, { data: '07-26', nome: 'Fundação da Cidade de Goiás' }, { data: '10-24', nome: 'Aniversário de Goiânia' }],
  'TJMA': [{ data: '07-28', nome: 'Adesão do MA à Independência' }, { data: '09-08', nome: 'Aniv. São Luís' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJMT': [{ data: '04-08', nome: 'Aniv. Cuiabá' }, { data: '11-20', nome: 'Consciência Negra (Estadual)' }],
  'TJMS': [{ data: '08-26', nome: 'Aniv. Campo Grande' }, { data: '10-11', nome: 'Criação do Estado de MS' }],
  'TJMG': [{ data: '08-15', nome: 'Assunção de Nra. Sra. (BH)' }, { data: '12-08', nome: 'Imaculada Conceição (BH)' }],
  'TJPA': [{ data: '01-12', nome: 'Aniv. Belém' }, { data: '08-15', nome: 'Adesão do Pará' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJPB': [{ data: '08-05', nome: 'Fundação da Paraíba' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJPR': [{ data: '09-08', nome: 'Nra. Sra. da Luz (Curitiba)' }, { data: '12-19', nome: 'Emancipação Política do Paraná' }],
  'TJPE': [{ data: '03-06', nome: 'Data Magna de PE' }, { data: '06-24', nome: 'São João' }, { data: '07-16', nome: 'Nra. Sra. do Carmo (Recife)' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJPI': [{ data: '03-13', nome: 'Batalha do Jenipapo' }, { data: '08-16', nome: 'Aniversário de Teresina' }, { data: '10-19', nome: 'Dia do Piauí' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJRJ': [{ data: '01-20', nome: 'Dia de São Sebastião' }, { data: '04-23', nome: 'Dia de São Jorge' }, { data: '10-28', nome: 'Dia do Servidor Público' }],
  'TJRN': [{ data: '01-06', nome: 'Santos Reis (Natal)' }, { data: '10-03', nome: 'Mártires de Cunhaú e Uruaçu' }, { data: '11-21', nome: 'Nra. Sra. da Apresentação' }],
  'TJRS': [{ data: '02-02', nome: 'Nra. Sra. dos Navegantes (Porto Alegre)' }, { data: '09-20', nome: 'Revolução Farroupilha' }],
  'TJRO': [{ data: '01-04', nome: 'Criação do Estado de RO' }, { data: '01-24', nome: 'Aniversário de Porto Velho' }, { data: '06-18', nome: 'Dia do Evangélico' }],
  'TJRR': [{ data: '07-09', nome: 'Aniversário de Boa Vista' }, { data: '10-05', nome: 'Aniversário de Roraima' }],
  'TJSC': [{ data: '03-23', nome: 'Aniv. Florianópolis' }, { data: '08-11', nome: 'Dia do Estado de SC' }],
  'TJSP': [{ data: '01-25', nome: 'Aniversário de São Paulo' }, { data: '07-09', nome: 'Revolução Constitucionalista' }],
  'TJSE': [{ data: '03-17', nome: 'Aniversário de Aracaju' }, { data: '07-08', nome: 'Emancipação Política de Sergipe' }, { data: '12-08', nome: 'Nra. Sra. da Conceição' }],
  'TJTO': [{ data: '03-18', nome: 'Autonomia do Estado' }, { data: '09-08', nome: 'Nra. Sra. da Natividade' }, { data: '10-05', nome: 'Criação de Tocantins' }],
  'TRF1': [{ data: '08-11', nome: 'Dia do Advogado (Lei 5.010)' }, { data: '11-01', nome: 'Todos os Santos (Lei 5.010)' }, { data: '11-30', nome: 'Dia do Evangélico (DF)' }],
  'TRF2': [{ data: '01-20', nome: 'S. Sebastião (RJ)' }, { data: '04-23', nome: 'S. Jorge (RJ)' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRF3': [{ data: '01-25', nome: 'Aniv. SP' }, { data: '07-09', nome: 'Rev. Const. (SP)' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRF4': [{ data: '02-02', nome: 'Nra Sra Navegantes (POA)' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '09-20', nome: 'Rev. Farroupilha' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRF5': [{ data: '03-06', nome: 'Data Magna PE' }, { data: '07-16', nome: 'Nra Sra Carmo (Recife)' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRF6': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '08-15', nome: 'Assunção Nra Sra (BH)' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT1': [{ data: '01-20', nome: 'S. Sebastião' }, { data: '04-23', nome: 'S. Jorge' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT2': [{ data: '01-25', nome: 'Aniv. SP' }, { data: '07-09', nome: 'Rev. Const.' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT3': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '08-15', nome: 'Assunção Nra Sra' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT4': [{ data: '02-02', nome: 'Navegantes' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '09-20', nome: 'Rev. Farroupilha' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT5': [{ data: '07-02', nome: 'Indep. BA' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT6': [{ data: '03-06', nome: 'Data Magna PE' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT7': [{ data: '03-19', nome: 'S. José' }, { data: '03-25', nome: 'Data Magna CE' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT8': [{ data: '01-12', nome: 'Aniv. Belém' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '08-15', nome: 'Adesão Pará' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT9': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '09-08', nome: 'Nra Sra Luz' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT10': [{ data: '04-21', nome: 'Aniv. Brasília' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT11': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '09-05', nome: 'Elev. Província' }, { data: '10-24', nome: 'Aniv. Manaus' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT12': [{ data: '03-23', nome: 'Aniv. Floripa' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT13': [{ data: '08-05', nome: 'Fund. Paraíba' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT14': [{ data: '01-04', nome: 'Criação RO' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT15': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }, { data: '12-08', nome: 'Imaculada Conceição' }],
  'TRT16': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '09-08', nome: 'Aniv. S. Luís' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT17': [{ data: '05-23', nome: 'Solo ES' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '09-08', nome: 'Aniv. Vitória' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT18': [{ data: '05-24', nome: 'Auxiliadora' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '10-24', nome: 'Aniv. Goiânia' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT19': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '08-27', nome: 'Nra Sra Prazeres' }, { data: '09-16', nome: 'Emanc. AL' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT20': [{ data: '03-17', nome: 'Aniv. Aracaju' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '07-08', nome: 'Emanc. SE' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT21': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '10-03', nome: 'Mártires' }, { data: '11-01', nome: 'Todos os Santos' }, { data: '11-21', nome: 'Apresentação' }],
  'TRT22': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '08-16', nome: 'Aniv. Teresina' }, { data: '10-19', nome: 'Dia PI' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT23': [{ data: '04-08', nome: 'Aniv. Cuiabá' }, { data: '08-11', nome: 'Dia do Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TRT24': [{ data: '08-11', nome: 'Dia do Advogado' }, { data: '08-26', nome: 'Aniv. Campo Grande' }, { data: '10-11', nome: 'Criação MS' }, { data: '11-01', nome: 'Todos os Santos' }],
  'STF': [{ data: '08-11', nome: 'Dia do Magistrado/Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'STJ': [{ data: '08-11', nome: 'Dia do Magistrado/Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TST': [{ data: '08-11', nome: 'Dia do Magistrado/Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'TSE': [{ data: '08-11', nome: 'Dia do Magistrado/Advogado' }, { data: '11-01', nome: 'Todos os Santos' }],
  'STM': [{ data: '08-11', nome: 'Dia do Magistrado/Advogado' }, { data: '11-01', nome: 'Todos os Santos' }]
};

/**
 * Suspensões específicas e pontuais (Atos, Portarias, Eventos Extraordinários).
 * Inclui suspensões do STF e STJ conforme atos recentes e placeholders para todos os outros tribunais.
 */
export const SUSPENSOES_PONTUAIS: Record<string, { data: string; nome: string }[]> = {
  'STF': [
    { data: '2024-05-02', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-03', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-06', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-07', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-08', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-09', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-10', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-13', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-14', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-15', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-16', nome: 'Res. 823/2024 - Suspensão Calamidade RS' },
    { data: '2024-05-17', nome: 'Res. 823/2024 - Suspensão Calamidade RS' }
  ],
  'STJ': [
    { data: '2024-05-02', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-03', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-06', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-07', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-08', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-09', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-10', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-13', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-14', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-15', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-16', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' },
    { data: '2024-05-17', nome: 'Port. STJ/GP 18/2024 - Calamidade RS' }
  ],
  'TJRS': [
    { data: '2024-05-01', nome: 'Suspensão Calamidade Pública RS' },
    { data: '2024-05-17', nome: 'Suspensão Calamidade Pública RS' }
  ],
  'TRF4': [
    { data: '2024-05-02', nome: 'Suspensão Calamidade RS (TRF4)' }
  ],
  'TRT4': [
    { data: '2024-05-02', nome: 'Suspensão Calamidade RS (TRT4)' }
  ],
  // Placeholders para os demais tribunais
  'TJAC': [], 'TJAL': [], 'TJAP': [], 'TJAM': [], 'TJBA': [], 'TJCE': [], 'TJDFT': [], 'TJES': [], 'TJGO': [], 'TJMA': [], 'TJMT': [], 'TJMS': [], 'TJMG': [], 'TJPA': [], 'TJPB': [], 'TJPR': [], 'TJPE': [], 'TJPI': [], 'TJRJ': [], 'TJRN': [], 'TJRO': [], 'TJRR': [], 'TJSC': [], 'TJSP': [], 'TJSE': [], 'TJTO': [], 'TRF1': [], 'TRF2': [], 'TRF3': [], 'TRF5': [], 'TRF6': [], 'TRT1': [], 'TRT2': [], 'TRT3': [], 'TRT5': [], 'TRT6': [], 'TRT7': [], 'TRT8': [], 'TRT9': [], 'TRT10': [], 'TRT11': [], 'TRT12': [], 'TRT13': [], 'TRT14': [], 'TRT15': [], 'TRT16': [], 'TRT17': [], 'TRT18': [], 'TRT19': [], 'TRT20': [], 'TRT21': [], 'TRT22': [], 'TRT23': [], 'TRT24': [], 'TST': [], 'TSE': [], 'STM': []
};

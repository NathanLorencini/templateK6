Template K6 – Estrutura Base para Testes de Performance
Template profissional e escalável para testes de performance com k6, oferecendo estrutura organizada, configuração simplificada e boas práticas de engenharia de qualidade.

🎯 Sobre o Projeto
Este template fornece uma base sólida para implementação de testes de performance (carga, stress, smoke) utilizando k6, com foco em:

Organização clara: Estrutura de pastas intuitiva e escalável
Configuração centralizada: Gerenciamento eficiente de variáveis de ambiente
Produtividade: Scripts npm/yarn prontos para uso
Reutilização: Componentes modulares e helpers compartilháveis
Padronização: Convenções consistentes entre projetos


📁 Estrutura do Projeto
templateK6/
│
├── src/
│   ├── tests/              # Scripts de teste organizados por contexto/feature
│   │   ├── smoke/          # Testes de fumaça (validação básica)
│   │   ├── load/           # Testes de carga (comportamento sob carga esperada)
│   │   └── stress/         # Testes de estresse (limites do sistema)
│   │
│   ├── utils/              # Funções auxiliares e helpers reutilizáveis
│   │   ├── config.js       # Carregamento e validação de variáveis
│   │   ├── helpers.js      # Funções utilitárias comuns
│   │   └── scenarios.js    # Cenários de carga predefinidos
│   │
│   └── data/               # Dados de teste (payloads, CSVs, fixtures)
│
├── reports/                # Relatórios gerados (gitignored)
├── .env.example            # Template de variáveis de ambiente
├── .env                    # Variáveis de ambiente (não commitar)
├── .gitignore
├── package.json            # Scripts de execução e dependências
├── k6.config.js            # Configurações globais do k6
└── README.md

🔧 Pré-requisitos
Certifique-se de ter instalado:

Node.js 18+ (Download)
k6 (Guia de instalação)

Verificar instalação
bashnode --version
k6 version

🚀 Instalação e Configuração
1. Clone o repositório
bashgit clone <url-do-repositorio>
cd templateK6
2. Instale as dependências
bashnpm install
# ou
yarn install
3. Configure as variáveis de ambiente
Copie o arquivo de exemplo e ajuste os valores:
bashcp .env.example .env
Exemplo de .env:
env# API Configuration
BASE_URL=https://api.exemplo.com
ACCESS_KEY=your_access_key_here
BRAND=123

# Test Configuration
VUS=10
DURATION=30s
ITERATIONS=100
4. Carregue as variáveis (Windows CMD)
Importante: Execute este comando antes de rodar os testes no CMD:
cmdfor /f "usebackq tokens=1,* delims== " %a in (.env) do @set "%a=%b"
Para PowerShell:
powershellGet-Content .env | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }
Para Linux/Mac:
bashexport $(cat .env | xargs)

▶️ Executando os Testes
Comandos disponíveis via npm/yarn
bash# Executar teste smoke (validação rápida)
npm run test:smoke

# Executar teste de carga
npm run test:load

# Executar teste de stress
npm run test:stress

# Executar teste específico
npm run test src/tests/seu-teste.js
Execução direta com k6
bash# Executar teste básico
k6 run src/tests/smoke/health-check.js

# Com configurações customizadas
k6 run --vus 50 --duration 2m src/tests/load/api-load.js

# Gerando relatório JSON
k6 run --out json=reports/results.json src/tests/load/api-load.js

# Executar com tags específicas
k6 run --tag ambiente=staging src/tests/smoke/health-check.js

⚙️ Usando Variáveis de Ambiente
As variáveis do .env ficam disponíveis através de __ENV:
javascriptimport http from 'k6/http';

export default function () {
  const url = `${__ENV.BASE_URL}/api/endpoint`;
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.ACCESS_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.get(url, params);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}

📊 Relatórios e Métricas
Saída para JSON
bashk6 run --out json=reports/resultado.json src/tests/load/api-load.js
Saída para InfluxDB
bashk6 run --out influxdb=http://localhost:8086/k6 src/tests/load/api-load.js
K6 Cloud
bashk6 cloud src/tests/load/api-load.js
Integração com Grafana

Configure o InfluxDB como datasource
Importe o dashboard oficial do k6: https://grafana.com/grafana/dashboards/2587
Execute testes com output para InfluxDB

Exemplo de docker-compose para stack de observabilidade:
yamlversion: '3.8'
services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true

📝 Exemplo de Teste Completo
javascriptimport http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métrica customizada
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp-up
    { duration: '3m', target: 20 },   // Carga estável
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    errors: ['rate<0.1'],              // Taxa de erro < 10%
  },
};

export default function () {
  const url = `${__ENV.BASE_URL}/api/users`;
  const payload = JSON.stringify({ name: 'Test User' });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(url, payload, params);
  
  const success = check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  sleep(1);
}

🧪 Boas Práticas

Modularize: Separe lógica de requisições, validações e configurações
Use checks: Valide respostas para garantir qualidade dos testes
Defina thresholds: Estabeleça critérios de sucesso claros
Organize por tipo: Mantenha smoke, load e stress separados
Versionamento: Não commite .env, use .env.example
Documente: Adicione comentários explicando cenários complexos


🤝 Contribuindo
Contribuições são muito bem-vindas! Para contribuir:

Faça um fork do projeto
Crie uma branch para sua feature (git checkout -b feature/MinhaFeature)
Commit suas mudanças (git commit -m 'Adiciona nova feature')
Push para a branch (git push origin feature/MinhaFeature)
Abra um Pull Request


📚 Recursos Adicionais

Documentação oficial do k6
Exemplos de testes
Métricas disponíveis
K6 Community Forum


📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
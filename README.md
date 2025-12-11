# Template K6 - Testes de Performance

Template simplificado para testes de performance com k6.

## Estrutura do Projeto

```
templateK6/
├── src/
│   ├── tests/          # Scripts de testes
│   └── utils/          # Funções reutilizáveis
├── .env                # Variáveis de ambiente
├── package.json        # Scripts de execução
└── README.md
```

## Pré-requisitos

- Node.js 18+
- k6 instalado: https://k6.io/docs/getting-started/installation/

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
BASE_URL=https://suaapi.com
ACCESS_KEY=seu_token_aqui
BRAND=123
```

### Carregar variáveis de ambiente

**Windows CMD:**
```cmd
for /f "usebackq tokens=1,* delims== " %a in (.env) do @set "%a=%b"
```

**PowerShell:**
```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }
```

**Linux/Mac:**
```bash
export $(cat .env | xargs)
```

## Executando os Testes

### Com npm/yarn

```bash
npm run test
```

### Direto com k6

```bash
k6 run src/tests/seu-teste.js
```

### Com configurações customizadas

```bash
k6 run --vus 50 --duration 2m src/tests/seu-teste.js
```

### Gerando relatório JSON

```bash
k6 run --out json=resultado.json src/tests/seu-teste.js
```

## Exemplo de Teste

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const url = `${__ENV.BASE_URL}/api/endpoint`;
  const response = http.get(url);
  
  check(response, {
    'status é 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## Usando Variáveis de Ambiente no Código

```javascript
const url = `${__ENV.BASE_URL}/endpoint`;
const token = __ENV.ACCESS_KEY;
```

## Relatórios

**JSON:**
```bash
k6 run --out json=reports/resultado.json src/tests/teste.js
```

**InfluxDB:**
```bash
k6 run --out influxdb=http://localhost:8086/k6 src/tests/teste.js
```

**K6 Cloud:**
```bash
k6 cloud src/tests/teste.js
```

## Contribuindo

Pull Requests são bem-vindos! Sinta-se à vontade para abrir issues e sugerir melhorias.

## Recursos

- Documentação k6: https://k6.io/docs/
- Exemplos: https://k6.io/docs/examples/
- Community: https://community.k6.io/
//import logo from '../assets/marcaAramis.png';

// testesDeCarga/modules/reporter-globalsys.js
export function gerarRelatorioGlobalsys(data, tipoTeste = 'carga', descricaoTeste = '', thresholdsDoTeste = {}) {
  function safeGet(obj, path, decimals = 2, defaultValue = 0) {
    try {
      const parts = path.split('.');
      let value = obj;
      for (const p of parts) {
        if (value && p in value) value = value[p];
        else return defaultValue;
      }
      const num = Number(value);
      return isNaN(num) ? defaultValue : num.toFixed(decimals);
    } catch {
      return defaultValue;
    }
  }

  // Gerar linhas de threshold manualmente
  function gerarLinhasThreshold() {
    let linhas = '';
    
    // Iterar sobre as chaves do objeto de forma compatível com k6
    for (const metric in thresholdsDoTeste) {
      if (!thresholdsDoTeste.hasOwnProperty(metric)) continue;
      
      const checks = thresholdsDoTeste[metric];
      if (!checks || !Array.isArray(checks)) continue;
      
      for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        let passed = false;
        
        if (metric === 'http_req_duration') {
          const parts = check.split('<');
          const percentil = parts[0];
          const limite = parts[1];
          const valorMetric = Number(data?.metrics?.http_req_duration?.values?.[percentil] ?? 0);
          passed = valorMetric < Number(limite);
        } else if (metric === 'http_req_failed') {
          const limite = Number(check.split('<')[1]);
          const valorMetric = Number(data?.metrics?.http_req_failed?.values?.rate ?? 0);
          passed = valorMetric < limite;
        } else if (metric === 'checks') {
          const limite = Number(check.split('>')[1]);
          const valorMetric = Number(data?.metrics?.checks?.values?.rate ?? 0);
          passed = valorMetric > limite;
        }
        
        const color = passed ? "#16a34a" : "#dc2626";
        const icon = passed ? "✅" : "❌";
        
        const metricDescriptions = {
          http_req_duration: "Tempo de resposta das requisições HTTP. Mede quanto o servidor demora para responder.",
          http_req_failed: "Taxa de requisições HTTP que falharam. Mede a confiabilidade do sistema.",
          checks: "Percentual de verificações internas do teste que passaram. Mede se as condições esperadas foram atendidas."
        };
        
        const conditionDescriptions = {
          '<500': "Valor menor que 500ms",
          '<800': "Valor menor que 800ms",
          '<1000': "Valor menor que 1s",
          '<1500': "Valor menor que 1,5s",
          '<2500': "Valor menor que 2,5s",
          '<4000': "Valor menor que 4s",
          '<0.01': "Taxa de falhas menor que 1%",
          '<0.02': "Taxa de falhas menor que 2%",
          '<0.05': "Taxa de falhas menor que 5%",
          '>0.95': "Mais de 95% das verificações passaram",
          '>0.97': "Mais de 97% das verificações passaram",
          '>0.98': "Mais de 98% das verificações passaram",
          '>0.99': "Mais de 99% das verificações passaram"
        };
        
        const metricDesc = metricDescriptions[metric] || '';
        const conditionDesc = conditionDescriptions[check] || '';
        
        linhas += `
          <tr>
            <td>${metric}</td>
            <td>${check}</td>
            <td>${metricDesc} ${conditionDesc}</td>
            <td style="color:${color};font-weight:bold;">${icon} ${passed ? 'Atingido' : 'Falhou'}</td>
          </tr>`;
      }
    }
    
    return linhas || '<tr><td colspan="4">Nenhum threshold configurado neste teste.</td></tr>';
  }

  const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório de Teste de Carga - GLOBALSYS</title>
<style>
  body {
    font-family: "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
  }
  header {
    background-color: #004aad;
    color: white;
    text-align: center;
    padding: 25px;
    font-size: 1.2em;
  }
  header img {
    height: 60px;
    vertical-align: middle;
    margin-right: 15px;
  }
  h1 { font-size: 1.8em; margin-bottom: 15px; }
  h2 { font-size: 1.4em; margin-top: 30px; margin-bottom: 15px; }
  .container {
    max-width: 1000px;
    margin: 30px auto;
    background: white;
    padding: 30px 40px;
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 1em;
  }
  th, td {
    border: 1px solid #e2e8f0;
    padding: 10px;
    text-align: left;
  }
  th { background-color: #f1f5f9; font-weight: bold; }
  .metric { font-weight: bold; color: #334155; }
  .success { color: #16a34a; font-weight: bold; }
  .fail { color: #dc2626; font-weight: bold; }
  footer {
    text-align: center;
    font-size: 0.85em;
    color: #64748b;
    margin: 20px;
  }
  .btn-export {
    background-color: #004aad;
    color: white;
    border: none;
    padding: 12px 20px;
    font-size: 1em;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
  }
  .btn-export:hover { background-color: #2563eb; }
  .summary {
    background-color: #e0f2fe;
    padding: 15px;
    border-left: 5px solid #004aad;
    border-radius: 5px;
    margin-bottom: 25px;
    font-size: 1em;
  }
  .tag {
    display: inline-block;
    background-color: #004aad;
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    margin-right: 5px;
    font-size: 0.9em;
  }
  #chart-container {
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
  }
  #chart {
    width: 100% !important;
    height: 250px !important;
  }
</style>
</head>
<body>
<header>
  <img src='../assets/marcaAramis.png' alt="Logo GLOBALSYS" onerror="this.style.display='none'">
  <span><strong>Aramis - Relatório de Teste de Carga</strong></span>
</header>

<div class="container">
  <h1>Resumo do Teste</h1>
  
  <div class="summary">
  <p><span class="tag">${tipoTeste.toUpperCase()}</span></p>
  <p><strong>Objetivo:</strong> ${descricaoTeste || 'Avaliar o desempenho e estabilidade do sistema sob carga.'}</p>
  <p><strong>Aplicação:</strong> Aramis - Ambiente Dev</p>
  <p><strong>URL Testada:</strong> ${data?.config?.url || '-'}</p>
  <p><strong>Execução:</strong> ${
    (() => {
      const now = new Date();
      return now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour12: false });
    })()
  }</p>
</div>

  <table>
    <tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td class="metric">Usuários Virtuais (VUs)</td><td>${safeGet(data, 'metrics.vus.values.max', 0)}</td></tr>
    <tr><td class="metric">Duração Total</td><td>${(data?.state?.testRunDurationMs / 1000 || 0).toFixed(1)} s</td></tr>
    <tr>
      <td class="metric">Total de Requisições</td>
      <td>${safeGet(data, 'metrics.http_reqs.values.count', 0)}</td>
    </tr>
    <tr>
      <td class="metric">Requisições Falhas</td>
      <td class="fail">${
        (() => {
          const totalReqs = Number(data?.metrics?.http_reqs?.values?.count ?? 0);
          const failRate = Number(data?.metrics?.http_req_failed?.values?.rate ?? 0);
          return Math.round(totalReqs * failRate);
        })()
      }</td>
    </tr>
    <tr>
      <td class="metric">Taxa de Sucesso</td>
      <td class="success">${(
        (1 - Number(data?.metrics?.http_req_failed?.values?.rate ?? 0)) * 100
      ).toFixed(2)}%</td>
    </tr>
    <tr><td class="metric">Tempo Médio de Resposta</td><td>${safeGet(data, 'metrics.http_req_duration.values.avg', 0)} ms</td></tr>
    <tr><td class="metric">P(90)</td><td>${data?.metrics?.http_req_duration?.values?.["p(90)"]?.toFixed(2) ?? '-' } ms</td></tr>
    <tr><td class="metric">P(95)</td><td>${data?.metrics?.http_req_duration?.values?.["p(95)"]?.toFixed(2) ?? '-' } ms</td></tr>
  </table>

  <h2>Validação de Thresholds</h2>
  <table>
    <tr><th>Métrica</th><th>Condição</th><th>Descrição</th><th>Status</th></tr>
    ${gerarLinhasThreshold()}
  </table>

  <h2>Distribuição de Latência</h2>
  <div id="chart-container">
    <canvas id="chart"></canvas>
  </div>

  <center>
    <button class="btn-export" onclick="exportPDF()">📄 Exportar para PDF</button>
  </center>
</div>

<footer>
  Relatório gerado automaticamente por k6 para GLOBALSYS em ${new Date().toLocaleString('pt-BR')}
</footer>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
<script>
  const chartData = [
    ${data?.metrics?.http_req_duration?.values?.["p(50)"] ?? 0},
    ${data?.metrics?.http_req_duration?.values?.["p(75)"] ?? 0},
    ${data?.metrics?.http_req_duration?.values?.["p(90)"] ?? 0},
    ${data?.metrics?.http_req_duration?.values?.["p(95)"] ?? 0},
    ${data?.metrics?.http_req_duration?.values?.["p(99)"] ?? 0}
  ];

  const ctx = document.getElementById('chart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['P(50)', 'P(75)', 'P(90)', 'P(95)', 'P(99)'],
      datasets: [{
        label: 'Tempo de Resposta (ms)',
        data: chartData,
        backgroundColor: '#004aad'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Tempo (ms)' } }
      }
    }
  });

  function exportPDF() {
    const element = document.body;
    html2pdf().from(element).set({
      margin: 0.3,
      filename: 'relatorio-globalsys.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).save();
  }
</script>
</body>
</html>`;

  return { 'relatorio-globalsys.html': html };
}
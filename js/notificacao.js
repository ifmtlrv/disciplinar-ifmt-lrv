// ============================================================
// NOTIFICAÇÃO — geração de documento de medida disciplinar (.doc)
// Modelo único baseado nas notificações padrão do Campus LRV
// ============================================================

let ocorrenciaParaNotificar = null;

function sugerirTextoNotificacao(o) {
  const info = incisoInfo(o.inciso);
  const dataFormatada = formatarData(o.data_falta);
  const descricaoBase = o.descricao ? o.descricao.trim().replace(/\.$/, "") : "praticar conduta em desacordo com as normas institucionais";

  const textoPrincipal =
    `Informamos que o(a) discente ${o.nome_discente}, regularmente matriculado(a) no curso ${o.curso}, ` +
    `foi notificado(a) por ${descricaoBase.charAt(0).toLowerCase() + descricaoBase.slice(1)}, ocorrido(a) no dia ${dataFormatada}. ` +
    `Tal conduta configura descumprimento das normas institucionais previstas no Regulamento Disciplinar Discente do IFMT.`;

  const fundamentacao =
    `A conduta do(a) discente infringe o Regulamento Disciplinar Discente do IFMT (Resolução nº 113, de 03 de dezembro de 2025), ` +
    `especificamente o Art. 11, inciso ${o.inciso} — ${info[1]}.`;

  const rodape =
    `Esta falta disciplinar será incluída na Ficha Individual do(a) Discente para registro. Casos de reincidência poderão implicar em medida disciplinar de grau maior. ` +
    `Não havendo reincidência em faltas leves e médias, o(a) discente retornará à condição de primariedade no prazo de 01 (um) ano.`;

  return {
    textoPrincipal,
    fundamentacao,
    tipoFalta: NIVEIS[info[2]].label.toUpperCase(),
    medida: NIVEIS[info[2]].medida,
    rodape
  };
}

function gerarHtmlNotificacao(dados) {
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const nl = (s) => esc(s).replace(/\n/g, "<br>");

  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="UTF-8"><title>Notificação ${esc(dados.numero)}</title>
<style>
  @page { size: A4; margin: 2.5cm 2cm 2cm 2cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; color:#000; line-height:1.5; }
  .cabecalho-orgao { text-align:center; margin-bottom: 18pt; }
  .cabecalho-orgao p { margin:0; line-height:1.3; }
  h1 { text-align:center; font-size:13pt; margin: 0 0 18pt; }
  .numero { font-weight:bold; }
  .data-doc { text-align:right; margin-bottom: 18pt; }
  p { text-align: left; margin: 0 0 12pt; }
  ul { margin: 0 0 12pt; padding-left: 24pt; }
  .campo-label { font-weight:bold; }
  .rodape-italico { font-style: italic; margin-top: 18pt; }
  .assinatura { margin-top: 40pt; text-align:center; }
</style>
</head>
<body>
  <div class="cabecalho-orgao">
    <p><strong>MINISTÉRIO DA EDUCAÇÃO</strong></p>
    <p>INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE MATO GROSSO</p>
    <p>Campus Lucas do Rio Verde</p>
    <p>Diretoria de Ensino</p>
  </div>

  <p class="numero">NOTIFICAÇÃO Nº ${esc(dados.numero)}</p>
  <p class="data-doc">Campus Lucas do Rio Verde, ${esc(dados.dataFormatadaExtenso)}</p>

  <h1>NOTIFICAÇÃO DE APLICAÇÃO DE MEDIDA DISCIPLINAR</h1>

  <p>${nl(dados.textoPrincipal)}</p>

  <p>${nl(dados.fundamentacao)}</p>

  ${dados.considerandos ? `<p>${nl(dados.considerandos)}</p>` : ""}

  <p><span class="campo-label">Tipo de falta disciplinar:</span> ${esc(dados.tipoFalta)}.<br>
  <span class="campo-label">Medida disciplinar:</span> ${esc(dados.medida)}</p>

  <p class="rodape-italico">${nl(dados.rodape)}</p>

  <div class="assinatura">
    <p>_______________________________________________</p>
    <p>Diretoria de Ensino — IFMT Campus Lucas do Rio Verde</p>
  </div>
</body>
</html>`;
}

function downloadComoDoc(nomeArquivo, html) {
  const blob = new Blob(["\ufeff" + html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo.replace(/\s+/g, "_") + ".doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function dataExtenso(isoOuVazia) {
  const d = isoOuVazia ? new Date(isoOuVazia + "T12:00:00") : new Date();
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

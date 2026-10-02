'use strict';
// Valores monetários são comparados em centavos para preservar os limites das metas.
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currencyInput = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = id => document.getElementById(id);
let customChallenge = false;
let nextEvaId = 0;

function parseNumber(raw) {
  const text = String(raw).trim().replace(/^R\$\s*/, '').replace(/\s/g, '');
  if (!text) return null;
  // Português brasileiro: 32.500,50; aceita também 32500.50.
  let normalized;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) normalized = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d+([,.]\d{1,2})?$/.test(text)) normalized = text.replace(',', '.');
  else return NaN;
  const value = Number(normalized);
  return Number.isFinite(value) && value <= 1000000000000 ? value : NaN;
}
const cents = value => Math.round(value * 100);
function commissionFor(sales, goal, challenge) {
  const rate = sales >= challenge ? 2.5 : sales >= goal ? 2 : 1.5;
  return { rate, amount: Math.round(sales * rate / 100) / 100 };
}
function readField(id, { required = false, positive = false, max = Infinity } = {}) {
  const value = parseNumber($(id).value);
  let error = '';
  if (value === null) error = required ? 'Preencha este valor.' : '';
  else if (!Number.isFinite(value) || value < 0 || value > max) error = max === 100 ? 'Informe um percentual entre 0 e 100.' : 'Informe um valor válido, sem números negativos.';
  else if (positive && value <= 0) error = 'A meta deve ser maior que zero.';
  $(id + '-error').textContent = error;
  $(id).setAttribute('aria-invalid', String(Boolean(error)));
  return error ? null : value;
}
function updateChallenge() {
  if (customChallenge) return;
  const goal = parseNumber($('goal').value);
  const increase = parseNumber($('increase').value);
  $('challenge').value = goal > 0 && Number.isFinite(goal) && increase !== null && Number.isFinite(increase)
    ? currencyInput.format(Math.round(cents(goal) * (1 + increase / 100)) / 100) : '';
}
function setProgress(prefix, sales, target) {
  const percent = sales / target * 100;
  $(prefix + '-percent').textContent = decimal.format(percent) + '%';
  $(prefix + '-progress').value = Math.min(percent, 100);
  $(prefix + '-gap').textContent = sales >= target ? 'Atingido! ' + money.format((sales - target) / 100) + ' acima do objetivo.' : 'Faltam ' + money.format((target - sales) / 100) + ' para atingir.';
}
function renderEva(sales) {
  const rows = [...$('eva-list').children];
  $('eva-empty').hidden = rows.length > 0;
  let complete = 0, pending = 0;
  rows.forEach(row => {
    const name = row.querySelector('.eva-name').value.trim();
    const percentInput = row.querySelector('.eva-percent');
    const valueInput = row.querySelector('.eva-value');
    const percent = parseNumber(percentInput.value);
    const value = parseNumber(valueInput.value);
    const badPercent = percent !== null && (!Number.isFinite(percent) || percent < 0 || percent > 100);
    const badValue = value !== null && (!Number.isFinite(value) || value < 0 || (sales !== null && cents(value) > sales));
    percentInput.setAttribute('aria-invalid', String(badPercent));
    valueInput.setAttribute('aria-invalid', String(badValue));
    row.querySelector('.eva-error').textContent = badPercent ? 'A participação deve estar entre 0% e 100%.' : badValue ? 'O valor da categoria deve ser válido e não pode superar o total vendido.' : '';
    const detail = row.querySelector('.eva-detail');
    const badge = row.querySelector('.eva-badge');
    badge.classList.remove('met');
    row.querySelector('.remove').setAttribute('aria-label', 'Remover desafio ' + (name || 'sem nome'));
    if (!name || percent === null || value === null || badPercent || badValue || sales === null || sales <= 0) {
      detail.textContent = sales === null || sales <= 0 ? 'Informe o total vendido para calcular a participação.' : 'Preencha nome, percentual e valor vendido.';
      badge.textContent = 'Pendente'; pending++; return;
    }
    const target = Math.ceil(sales * percent / 100 - 1e-7);
    const sold = cents(value);
    const achieved = sold >= target;
    detail.textContent = 'Objetivo: ' + money.format(target / 100) + ' · Participação atual: ' + decimal.format(sold / sales * 100) + '%' + (achieved ? '' : ' · Faltam ' + money.format((target - sold) / 100));
    badge.textContent = achieved ? 'Atingido' : 'Em andamento';
    badge.classList.toggle('met', achieved);
    if (achieved) complete++;
  });
  $('summary-eva').textContent = rows.length ? 'Desafios EVA: ' + complete + ' de ' + rows.length + ' atingidos.' + (pending ? ' ' + pending + ' pendente(s) de preenchimento.' : '') : 'Nenhum desafio EVA adicionado.';
}
function render() {
  const salesValue = readField('sales');
  const goalValue = readField('goal', { positive: true });
  const increase = readField('increase');
  let challengeValue = readField('challenge');
  if (goalValue > 0 && challengeValue !== null && challengeValue < goalValue) {
    $('challenge-error').textContent = 'O desafio não pode ser menor que a meta.';
    $('challenge').setAttribute('aria-invalid', 'true'); challengeValue = null;
  }
  $('challenge-hint').textContent = customChallenge ? 'Valor personalizado. Edite o acréscimo para voltar ao cálculo automático.' : 'Calculado pela meta + ' + (increase === null ? '…' : decimal.format(increase)) + '%. Você pode editar o valor.';
  const sales = salesValue === null ? null : cents(salesValue);
  const valid = sales !== null && goalValue > 0 && challengeValue >= goalValue && challengeValue !== null && (customChallenge || increase !== null);
  const result = valid ? commissionFor(sales, cents(goalValue), cents(challengeValue)) : { rate: 0, amount: 0 };
  $('commission').textContent = valid ? money.format(result.amount) : 'R$ 0,00';
  $('summary-commission').textContent = valid ? money.format(result.amount) : '—';
  $('status').textContent = !valid ? 'Aguardando valores' : result.rate === 2.5 ? 'Desafio atingido' : result.rate === 2 ? 'Meta atingida' : 'Meta em andamento';
  $('formula').textContent = !valid ? 'Preencha valores válidos de vendas, meta e desafio.' : result.rate ? decimal.format(result.rate) + '% sobre ' + money.format(salesValue) + ' em vendas.' : 'A comissão começa ao atingir a meta de vendas.';
  ['goal', 'challenge'].forEach(prefix => {
    if (valid) setProgress(prefix, sales, cents(prefix === 'goal' ? goalValue : challengeValue));
    else { $(prefix + '-percent').textContent = '—'; $(prefix + '-progress').value = 0; $(prefix + '-gap').textContent = 'Preencha os valores para acompanhar.'; }
  });
  $('summary-sales').textContent = salesValue === null ? '—' : money.format(salesValue);
  $('summary-goal').textContent = goalValue === null ? '—' : money.format(goalValue);
  $('summary-challenge').textContent = challengeValue === null ? '—' : money.format(challengeValue);
  $('summary-rate').textContent = valid ? decimal.format(result.rate) + '%' : '—';
  renderEva(sales);
}
function formatMoney(input) {
  const value = parseNumber(input.value);
  if (value !== null && Number.isFinite(value)) input.value = currencyInput.format(value);
}
['sales', 'goal', 'increase', 'challenge'].forEach(id => {
  $(id).addEventListener('input', () => {
    if (id === 'challenge') customChallenge = true;
    if (id === 'increase') customChallenge = false;
    if (id === 'goal' || id === 'increase') updateChallenge();
    render();
  });
  if (id !== 'increase') $(id).addEventListener('blur', () => formatMoney($(id)));
});
$('add-eva').addEventListener('click', () => {
  const row = $('eva-template').content.firstElementChild.cloneNode(true);
  const number = ++nextEvaId;
  [['name', 'name'], ['percent', 'percent'], ['value', 'value']].forEach(([field, label]) => {
    const input = row.querySelector('.eva-' + field);
    input.id = 'eva-' + number + '-' + field;
    row.querySelector('.' + label + '-label').htmlFor = input.id;
    input.addEventListener('input', render);
  });
  row.querySelector('.eva-value').addEventListener('blur', event => formatMoney(event.target));
  row.querySelector('.remove').addEventListener('click', () => { row.remove(); render(); $('add-eva').focus(); });
  $('eva-list').append(row); render(); row.querySelector('input').focus();
});
render();

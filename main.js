/* ============================================
   SDG 8 — Main JavaScript
   ============================================ */

// ── Navigation ──
const nav = document.getElementById('mainNav');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  // Sticky shadow
  nav.classList.toggle('scrolled', window.scrollY > 10);

  // Progress bar
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// ── SPA Navigation ──
function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  navLinks.classList.remove('open');
}

document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showPage(el.dataset.page);
  });
});

// Init
showPage('home');

// ── Budget Calculator ──
function calculateBudget() {
  const income = parseFloat(document.getElementById('income').value) || 0;

  if (income <= 0) {
    alert('Please enter your monthly income first.');
    return;
  }

  const expenses = {
    housing:       parseFloat(document.getElementById('exp-housing').value) || 0,
    food:          parseFloat(document.getElementById('exp-food').value) || 0,
    transport:     parseFloat(document.getElementById('exp-transport').value) || 0,
    utilities:     parseFloat(document.getElementById('exp-utilities').value) || 0,
    healthcare:    parseFloat(document.getElementById('exp-healthcare').value) || 0,
    entertainment: parseFloat(document.getElementById('exp-entertainment').value) || 0,
    clothing:      parseFloat(document.getElementById('exp-clothing').value) || 0,
    savings:       parseFloat(document.getElementById('exp-savings').value) || 0,
    other:         parseFloat(document.getElementById('exp-other').value) || 0,
  };

  const expenseLabels = {
    housing:       'Housing / Rent',
    food:          'Food & Groceries',
    transport:     'Transport',
    utilities:     'Bills & Utilities',
    healthcare:    'Healthcare',
    entertainment: 'Entertainment',
    clothing:      'Clothing',
    savings:       'Savings',
    other:         'Other',
  };

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const surplus = income - totalExpenses;
  const savingsRate = income > 0 ? ((expenses.savings / income) * 100) : 0;

  // Recommended % ranges
  const recommended = {
    housing:       { max: 30 },
    food:          { max: 15 },
    transport:     { max: 15 },
    utilities:     { max: 10 },
    healthcare:    { max: 10 },
    entertainment: { max: 10 },
    clothing:      { max: 5 },
    savings:       { min: 20 },
    other:         { max: 10 },
  };

  // Build results
  const resultsCard = document.getElementById('resultsCard');
  resultsCard.classList.add('show');

  document.getElementById('res-income').textContent = fmt(income);
  document.getElementById('res-expenses').textContent = fmt(totalExpenses);
  document.getElementById('res-surplus').textContent = fmt(Math.abs(surplus));
  document.getElementById('res-surplus').className = 'value ' + (surplus >= 0 ? 'positive' : 'negative');
  document.getElementById('res-surplus-label').textContent = surplus >= 0 ? 'Monthly surplus' : 'Monthly shortfall';
  document.getElementById('res-savings-rate').textContent = savingsRate.toFixed(1) + '%';
  document.getElementById('res-savings-rate').className = 'value ' + (savingsRate >= 20 ? 'positive' : savingsRate >= 10 ? 'neutral' : 'negative');

  // Breakdown bars
  const barsContainer = document.getElementById('expenseBars');
  barsContainer.innerHTML = '';

  Object.entries(expenses).forEach(([key, val]) => {
    if (val === 0) return;
    const pct = income > 0 ? ((val / income) * 100) : 0;
    const rec = recommended[key];
    let status = 'normal';

    if (rec.max && pct > rec.max) status = 'danger';
    else if (rec.max && pct > rec.max * 0.85) status = 'warning';
    else if (key === 'savings' && pct < (rec.min || 0)) status = 'warning';
    else if (key === 'savings') status = 'savings';

    const barClass = status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : key === 'savings' ? 'savings' : '';

    barsContainer.innerHTML += `
      <div class="bar-row">
        <div class="bar-label">
          <span>${expenseLabels[key]}</span>
          <span class="pct-label">${fmt(val)} (${pct.toFixed(1)}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${barClass}" style="width: ${Math.min(pct, 100)}%"></div>
        </div>
      </div>
    `;
  });

  // Tips
  const tipsContainer = document.getElementById('tipsContainer');
  tipsContainer.innerHTML = '';
  let hasTips = false;

  const tips = [];

  if (expenses.housing / income * 100 > 30) {
    tips.push({ type: 'warn', msg: 'Housing costs exceed 30% of income. Consider if there are options to reduce rent — perhaps sharing accommodation or relocating slightly.' });
  }
  if (expenses.food / income * 100 > 15) {
    tips.push({ type: 'warn', msg: 'Food spending is above 15%. Meal planning and cooking at home can significantly reduce this — try batch cooking on weekends.' });
  }
  if (expenses.entertainment / income * 100 > 10) {
    tips.push({ type: 'warn', msg: 'Entertainment is above 10% of income. Look for free local events, swap streaming subscriptions, or set a weekly fun budget.' });
  }
  if (expenses.savings / income * 100 < 10 && expenses.savings > 0) {
    tips.push({ type: 'warn', msg: `You're saving ${savingsRate.toFixed(1)}% of income. The recommended target is 20%. Even small increases add up significantly over time.` });
  }
  if (expenses.savings === 0) {
    tips.push({ type: 'warn', msg: "You haven't allocated anything to savings. Even £20–£50/month builds an emergency fund and good financial habits." });
  }
  if (surplus < 0) {
    tips.push({ type: 'warn', msg: `You're spending £${Math.abs(surplus).toFixed(0)} more than you earn. Review your largest expense categories and look for areas to cut back.` });
  }
  if (savingsRate >= 20) {
    tips.push({ type: 'good', msg: `Great work! You're saving ${savingsRate.toFixed(1)}% of income — above the recommended 20% benchmark. Consider investing the excess for long-term growth.` });
  }
  if (surplus >= 0 && surplus <= income * 0.05 && expenses.savings >= income * 0.2) {
    tips.push({ type: 'info', msg: "Your budget is well-structured. Your surplus is small — consider putting it in a rainy-day fund for unexpected costs." });
  }
  if (surplus > income * 0.15) {
    tips.push({ type: 'good', msg: `You have a healthy surplus of ${fmt(surplus)}. Consider allocating this to an investment account or pension contribution for long-term financial security.` });
  }

  if (tips.length === 0) {
    tips.push({ type: 'good', msg: 'Your budget looks balanced. Keep tracking your spending to maintain these healthy habits!' });
  }

  tips.forEach(t => {
    const icon = t.type === 'warn' ? '⚠️' : t.type === 'good' ? '✅' : 'ℹ️';
    tipsContainer.innerHTML += `
      <div class="tip-alert ${t.type === 'warn' ? 'warn' : t.type === 'good' ? 'good' : 'info'}">
        <span class="icon">${icon}</span>
        <span>${t.msg}</span>
      </div>
    `;
  });

  // Scroll to results
  resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Savings Goal Calculator ──
function calculateSavings() {
  const goal   = parseFloat(document.getElementById('goal-amount').value) || 0;
  const months = parseInt(document.getElementById('goal-months').value) || 0;
  const current = parseFloat(document.getElementById('goal-current').value) || 0;

  if (goal <= 0 || months <= 0) {
    alert('Please enter a goal amount and timeframe.');
    return;
  }

  const remaining = Math.max(goal - current, 0);
  const monthly = remaining / months;

  const result = document.getElementById('savingsResult');
  result.classList.add('show');
  document.getElementById('monthly-need').textContent = fmt(monthly) + ' / month';
  document.getElementById('savings-desc').textContent =
    `To reach ${fmt(goal)} in ${months} month${months !== 1 ? 's' : ''}` +
    (current > 0 ? ` (you already have ${fmt(current)})` : '') +
    `, save ${fmt(monthly)} each month.`;
}

// ── Utility ──
function fmt(n) {
  return '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ── Animate on scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-up').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

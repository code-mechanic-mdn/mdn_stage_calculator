// ===================== STATE =====================
let currentTab = 'stage'; // 'stage' | 'services'
const selected = {}; // componentId → quantity (stage tab)
const selectedServices = {}; // serviceId → quantity (services tab)

// ===================== HELPERS =====================
function getMat(id) {
    return materials.find(m => m.id === id);
}

function fmt(value) {
    return '$' + value.toLocaleString('pt-BR');
}

function getImgSrc(id) {
    const mat = materials.find(m => m.id === id);
    if (mat) return mat.image;
    const comp = components.find(c => c.id === id);
    if (comp) return comp.image;
    return '';
}

// ===================== TAB SWITCHING =====================
function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update panel titles
    if (tab === 'stage') {
        document.getElementById('panelTitle').textContent = 'Componentes';
        document.getElementById('detailTitle').textContent = 'Craft Calculator';
        document.getElementById('detailSubtitle').textContent = 'Selecione componentes para calcular';
    } else {
        document.getElementById('panelTitle').textContent = 'Serviços';
        document.getElementById('detailTitle').textContent = 'Service Calculator';
        document.getElementById('detailSubtitle').textContent = 'Selecione serviços para calcular';
    }

    document.getElementById('discountInput').value = 0;
    renderList();
    renderSummary();
}

// ===================== RENDER LIST =====================
function renderList() {
    if (currentTab === 'services') {
        renderServicesList();
        return;
    }
    renderStageList();
}

function renderStageList() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    const stages = [1, 2, 3];
    stages.forEach(stage => {
        const stageComps = components.filter(c => c.stage === stage);
        if (stageComps.length === 0) return;

        const stageHeader = document.createElement('div');
        stageHeader.className = 'stage-header';
        stageHeader.innerHTML = `<span class="stage-badge stage-${stage}">S${stage}</span> Stage ${stage}`;
        list.appendChild(stageHeader);

        stageComps.forEach(comp => {
            const row = document.createElement('div');
            row.className = 'item-row' + (selected[comp.id] ? ' selected' : '');

            const qty = selected[comp.id] || 1;

            row.innerHTML = `
                <span class="item-dot"></span>
                <div class="item-icon">
                    <img src="${getImgSrc(comp.id)}" alt="${comp.name}" loading="lazy" onerror="this.parentElement.textContent='🔩'">
                </div>
                <div class="item-text">
                    <span class="item-name">${comp.name}</span>
                    <span class="item-sell-price">${fmt(comp.sellPrice)}</span>
                </div>
                <div class="item-qty-controls">
                    <button class="qty-btn" data-action="dec" data-id="${comp.id}">−</button>
                    <span class="qty-display">${qty}</span>
                    <button class="qty-btn" data-action="inc" data-id="${comp.id}">+</button>
                </div>
            `;

            row.addEventListener('click', (e) => {
                if (e.target.closest('.qty-btn')) return;
                toggleItem(comp.id, selected);
            });

            list.appendChild(row);
        });
    });

    bindQtyButtons(list, selected);
    document.getElementById('countBadge').textContent = Object.keys(selected).length;
}

function renderServicesList() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    // Group: Repairs, then Tools
    const repairs = services.filter(s => s.id.startsWith('repair_'));
    const tools = services.filter(s => !s.id.startsWith('repair_'));

    const groups = [
        { label: 'Reparos', icon: '🔧', items: repairs },
        { label: 'Ferramentas', icon: '🔑', items: tools }
    ];

    groups.forEach(group => {
        if (group.items.length === 0) return;

        const header = document.createElement('div');
        header.className = 'stage-header';
        header.innerHTML = `<span class="service-badge">${group.icon}</span> ${group.label}`;
        list.appendChild(header);

        group.items.forEach(svc => {
            const row = document.createElement('div');
            row.className = 'item-row' + (selectedServices[svc.id] ? ' selected' : '');

            const qty = selectedServices[svc.id] || 1;

            const iconHtml = svc.image
                ? `<div class="item-icon"><img src="${svc.image}" alt="${svc.name}" loading="lazy" onerror="this.parentElement.textContent='🔧'"></div>`
                : `<div class="item-icon service-icon-placeholder">🔧</div>`;

            row.innerHTML = `
                <span class="item-dot"></span>
                ${iconHtml}
                <div class="item-text">
                    <span class="item-name">${svc.name}</span>
                    <span class="item-sell-price">${fmt(svc.price)}</span>
                </div>
                <div class="item-qty-controls">
                    <button class="qty-btn" data-action="dec" data-id="${svc.id}">−</button>
                    <span class="qty-display">${qty}</span>
                    <button class="qty-btn" data-action="inc" data-id="${svc.id}">+</button>
                </div>
            `;

            row.addEventListener('click', (e) => {
                if (e.target.closest('.qty-btn')) return;
                toggleItem(svc.id, selectedServices);
            });

            list.appendChild(row);
        });
    });

    bindQtyButtons(list, selectedServices);
    document.getElementById('countBadge').textContent = Object.keys(selectedServices).length;
}

// ===================== SHARED HELPERS =====================
function toggleItem(id, store) {
    if (store[id]) {
        delete store[id];
    } else {
        store[id] = 1;
    }
    renderList();
    renderSummary();
}

function bindQtyButtons(container, store) {
    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (btn.dataset.action === 'inc') {
                store[id] = (store[id] || 1) + 1;
            } else if (store[id] > 1) {
                store[id]--;
            }
            renderList();
            renderSummary();
        });
    });
}

// ===================== RENDER SUMMARY =====================
function renderSummary() {
    if (currentTab === 'services') {
        renderServicesSummary();
        return;
    }
    renderStageSummary();
}

function renderStageSummary() {
    const emptyEl = document.getElementById('emptyState');
    const contentEl = document.getElementById('summaryContent');
    const clearBtn = document.getElementById('clearBtn');
    const ids = Object.keys(selected);
    const discountGroup = document.getElementById('discountGroup');

    if (ids.length === 0) {
        emptyEl.style.display = '';
        contentEl.style.display = 'none';
        clearBtn.style.display = 'none';
        discountGroup.style.display = 'none';
        updateCombinedTotal();
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = '';
    clearBtn.style.display = '';
    discountGroup.style.display = '';

    // Aggregate materials
    const totals = {};
    ids.forEach(compId => {
        const comp = components.find(c => c.id === compId);
        const qty = selected[compId];
        comp.ingredients.forEach(ing => {
            totals[ing.id] = (totals[ing.id] || 0) + ing.quantity * qty;
        });
    });

    // Selected component chips
    let html = '<div class="selected-chips">';
    ids.forEach(compId => {
        const comp = components.find(c => c.id === compId);
        const qty = selected[compId];
        html += `<span class="chip"><span class="stage-badge stage-${comp.stage} small">S${comp.stage}</span>${comp.name}`;
        if (qty > 1) html += ` <span class="chip-qty">×${qty}</span>`;
        html += `<button class="chip-remove" data-rid="${compId}">✕</button></span>`;
    });
    html += '</div>';

    // Materials breakdown
    html += '<div class="materials-section-title">Materiais Necessários</div>';
    html += '<div class="materials-grid">';

    let totalCost = 0;
    let totalQty = 0;

    Object.keys(totals).forEach(matId => {
        const mat = getMat(matId);
        const qty = totals[matId];
        const cost = qty * (mat ? mat.price : 0);
        totalCost += cost;
        totalQty += qty;

        html += `
            <div class="material-card anim-in">
                <div class="mat-icon">
                    <img src="${mat ? getImgSrc(mat.id) : ''}" alt="${mat ? mat.name : matId}" loading="lazy" onerror="this.parentElement.textContent='🔹'">
                </div>
                <div class="mat-info">
                    <div class="mat-name">${mat ? mat.name : matId}</div>
                    <div class="mat-qty-row">
                        <span class="mat-qty">${qty.toLocaleString('pt-BR')}</span>
                        <span class="mat-cost">· ${fmt(cost)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';

    // Calculate sell revenue with discount
    const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
    let totalSellBase = 0;
    ids.forEach(compId => {
        const comp = components.find(c => c.id === compId);
        totalSellBase += comp.sellPrice * selected[compId];
    });
    const discountAmount = totalSellBase * (discountPct / 100);
    const totalSellRevenue = totalSellBase - discountAmount;
    const mechanicCut = totalSellRevenue * 0.20;
    const netRevenue = totalSellRevenue - mechanicCut;
    const profit = netRevenue - totalCost;

    // Total bars
    html += `
        <div class="totals-grid">
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Custo Materiais</span>
                    <span class="total-items-label">${totalQty.toLocaleString('pt-BR')} materiais refinados</span>
                </div>
                <span class="total-value cost">${fmt(totalCost)}</span>
            </div>
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Venda Bruta</span>
                    <span class="total-items-label">${ids.length} componente${ids.length > 1 ? 's' : ''}${discountPct > 0 ? ' · base ' + fmt(totalSellBase) + ' − ' + discountPct + '% (−' + fmt(discountAmount) + ')' : ''}</span>
                </div>
                <span class="total-value sell">${fmt(totalSellRevenue)}</span>
            </div>
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Mecânico (20%)</span>
                    <span class="total-items-label">comissão sobre venda</span>
                </div>
                <span class="total-value mechanic">-${fmt(mechanicCut)}</span>
            </div>
            <div class="total-bar profit-bar">
                <div class="total-left">
                    <span class="total-label">Lucro Líquido</span>
                    <span class="total-items-label">venda − mecânico − materiais</span>
                </div>
                <span class="total-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${profit >= 0 ? '+' : ''}${fmt(profit)}</span>
            </div>
        </div>
    `;

    contentEl.innerHTML = html;

    // Chip remove handlers
    contentEl.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            delete selected[btn.dataset.rid];
            renderList();
            renderSummary();
        });
    });

    updateCombinedTotal();
}

function renderServicesSummary() {
    const emptyEl = document.getElementById('emptyState');
    const contentEl = document.getElementById('summaryContent');
    const clearBtn = document.getElementById('clearBtn');
    const ids = Object.keys(selectedServices);
    const discountGroup = document.getElementById('discountGroup');

    if (ids.length === 0) {
        emptyEl.style.display = '';
        contentEl.style.display = 'none';
        clearBtn.style.display = 'none';
        discountGroup.style.display = 'none';
        updateCombinedTotal();
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = '';
    clearBtn.style.display = '';
    discountGroup.style.display = '';

    // Aggregate materials
    const totals = {};
    ids.forEach(svcId => {
        const svc = services.find(s => s.id === svcId);
        const qty = selectedServices[svcId];
        svc.ingredients.forEach(ing => {
            totals[ing.id] = (totals[ing.id] || 0) + ing.quantity * qty;
        });
    });

    // Selected service chips
    let html = '<div class="selected-chips">';
    ids.forEach(svcId => {
        const svc = services.find(s => s.id === svcId);
        const qty = selectedServices[svcId];
        html += `<span class="chip"><span class="service-chip-badge">🔧</span>${svc.name}`;
        if (qty > 1) html += ` <span class="chip-qty">×${qty}</span>`;
        html += `<button class="chip-remove" data-rid="${svcId}">✕</button></span>`;
    });
    html += '</div>';

    // Materials breakdown
    html += '<div class="materials-section-title">Materiais Necessários</div>';
    html += '<div class="materials-grid">';

    let totalCost = 0;
    let totalQty = 0;

    Object.keys(totals).forEach(matId => {
        const mat = getMat(matId);
        const qty = totals[matId];
        const cost = qty * (mat ? mat.price : 0);
        totalCost += cost;
        totalQty += qty;

        html += `
            <div class="material-card anim-in">
                <div class="mat-icon">
                    <img src="${mat ? getImgSrc(mat.id) : ''}" alt="${mat ? mat.name : matId}" loading="lazy" onerror="this.parentElement.textContent='🔹'">
                </div>
                <div class="mat-info">
                    <div class="mat-name">${mat ? mat.name : matId}</div>
                    <div class="mat-qty-row">
                        <span class="mat-qty">${qty.toLocaleString('pt-BR')}</span>
                        <span class="mat-cost">· ${fmt(cost)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';

    // Calculate sell revenue with discount
    const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
    let totalSellBase = 0;
    ids.forEach(svcId => {
        const svc = services.find(s => s.id === svcId);
        totalSellBase += svc.price * selectedServices[svcId];
    });
    const discountAmount = totalSellBase * (discountPct / 100);
    const totalSellRevenue = totalSellBase - discountAmount;
    const mechanicCut = totalSellRevenue * 0.20;
    const netRevenue = totalSellRevenue - mechanicCut;
    const profit = netRevenue - totalCost;

    // Total bars
    html += `
        <div class="totals-grid">
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Custo Materiais</span>
                    <span class="total-items-label">${totalQty.toLocaleString('pt-BR')} materiais refinados</span>
                </div>
                <span class="total-value cost">${fmt(totalCost)}</span>
            </div>
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Venda Bruta</span>
                    <span class="total-items-label">${ids.length} serviço${ids.length > 1 ? 's' : ''}${discountPct > 0 ? ' · base ' + fmt(totalSellBase) + ' − ' + discountPct + '% (−' + fmt(discountAmount) + ')' : ''}</span>
                </div>
                <span class="total-value sell">${fmt(totalSellRevenue)}</span>
            </div>
            <div class="total-bar">
                <div class="total-left">
                    <span class="total-label">Mecânico (20%)</span>
                    <span class="total-items-label">comissão sobre venda</span>
                </div>
                <span class="total-value mechanic">-${fmt(mechanicCut)}</span>
            </div>
            <div class="total-bar profit-bar">
                <div class="total-left">
                    <span class="total-label">Lucro Líquido</span>
                    <span class="total-items-label">venda − mecânico − materiais</span>
                </div>
                <span class="total-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${profit >= 0 ? '+' : ''}${fmt(profit)}</span>
            </div>
        </div>
    `;

    contentEl.innerHTML = html;

    // Chip remove handlers
    contentEl.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            delete selectedServices[btn.dataset.rid];
            renderList();
            renderSummary();
        });
    });

    updateCombinedTotal();
}

// ===================== COMBINED TOTAL =====================
function calcStageProfit() {
    const ids = Object.keys(selected);
    if (ids.length === 0) return 0;

    let totalCost = 0;
    let totalSellBase = 0;
    ids.forEach(compId => {
        const comp = components.find(c => c.id === compId);
        const qty = selected[compId];
        totalSellBase += comp.sellPrice * qty;
        comp.ingredients.forEach(ing => {
            const mat = getMat(ing.id);
            totalCost += ing.quantity * qty * (mat ? mat.price : 0);
        });
    });

    const discountPct = currentTab === 'stage' ? (parseFloat(document.getElementById('discountInput').value) || 0) : 0;
    const totalSellRevenue = totalSellBase - totalSellBase * (discountPct / 100);
    const mechanicCut = totalSellRevenue * 0.20;
    return totalSellRevenue - mechanicCut - totalCost;
}

function calcServicesProfit() {
    const ids = Object.keys(selectedServices);
    if (ids.length === 0) return 0;

    let totalCost = 0;
    let totalSellBase = 0;
    ids.forEach(svcId => {
        const svc = services.find(s => s.id === svcId);
        const qty = selectedServices[svcId];
        totalSellBase += svc.price * qty;
        svc.ingredients.forEach(ing => {
            const mat = getMat(ing.id);
            totalCost += ing.quantity * qty * (mat ? mat.price : 0);
        });
    });

    const discountPct = currentTab === 'services' ? (parseFloat(document.getElementById('discountInput').value) || 0) : 0;
    const totalSellRevenue = totalSellBase - totalSellBase * (discountPct / 100);
    const mechanicCut = totalSellRevenue * 0.20;
    return totalSellRevenue - mechanicCut - totalCost;
}

function updateCombinedTotal() {
    const stageProfit = calcStageProfit();
    const servicesProfit = calcServicesProfit();
    const total = stageProfit + servicesProfit;

    const footer = document.getElementById('combinedFooter');
    const hasAny = Object.keys(selected).length > 0 || Object.keys(selectedServices).length > 0;

    if (!hasAny) {
        footer.style.display = 'none';
        return;
    }

    footer.style.display = '';
    const stageEl = document.getElementById('combinedStage');
    const servicesEl = document.getElementById('combinedServices');
    const totalEl = document.getElementById('combinedTotal');

    stageEl.textContent = (stageProfit >= 0 ? '+' : '') + fmt(stageProfit);
    stageEl.className = 'combined-value ' + (stageProfit >= 0 ? 'profit-positive' : 'profit-negative');

    servicesEl.textContent = (servicesProfit >= 0 ? '+' : '') + fmt(servicesProfit);
    servicesEl.className = 'combined-value ' + (servicesProfit >= 0 ? 'profit-positive' : 'profit-negative');

    totalEl.textContent = (total >= 0 ? '+' : '') + fmt(total);
    totalEl.className = 'combined-value combined-total-value ' + (total >= 0 ? 'profit-positive' : 'profit-negative');
}

// ===================== INIT =====================
// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    const store = currentTab === 'stage' ? selected : selectedServices;
    Object.keys(store).forEach(k => delete store[k]);
    document.getElementById('discountInput').value = 0;
    renderList();
    renderSummary();
});

// Discount input
document.getElementById('discountInput').addEventListener('input', () => {
    renderSummary();
});

renderList();
renderSummary();


// ===================== STATE =====================
const selected = {}; // componentId → quantity

// ===================== HELPERS =====================
function getMat(id) {
    return materials.find(m => m.id === id);
}

function fmt(value) {
    return '$' + value.toLocaleString('pt-BR');
}

// Images are read directly from data.js (materials[].image / components[].image)
function getImgSrc(id) {
    const mat = materials.find(m => m.id === id);
    if (mat) return mat.image;
    const comp = components.find(c => c.id === id);
    if (comp) return comp.image;
    return '';
}

// ===================== RENDER LIST =====================
function renderList() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    // Group by stage
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
                toggleItem(comp.id);
            });

            list.appendChild(row);
        });
    });

    // Quantity button events
    list.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (btn.dataset.action === 'inc') {
                selected[id] = (selected[id] || 1) + 1;
            } else if (selected[id] > 1) {
                selected[id]--;
            }
            renderList();
            renderSummary();
        });
    });

    document.getElementById('countBadge').textContent = Object.keys(selected).length;
}

function toggleItem(id) {
    if (selected[id]) {
        delete selected[id];
    } else {
        selected[id] = 1;
    }
    renderList();
    renderSummary();
}

// ===================== RENDER SUMMARY =====================
function renderSummary() {
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
}

// ===================== INIT =====================
document.getElementById('clearBtn').addEventListener('click', () => {
    Object.keys(selected).forEach(k => delete selected[k]);
    document.getElementById('discountInput').value = 0;
    renderList();
    renderSummary();
});

document.getElementById('discountInput').addEventListener('input', () => {
    renderSummary();
});

renderList();
renderSummary();

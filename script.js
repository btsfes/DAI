    // --- State Management ---
    let tables = {}; // Stocke les tables de base
    let results = []; // Stocke les résultats générés
    let currentOp = 'select';

    // --- Initialisation ---
    function init() {
        renderTables();
        updateOpForm();
    }

    // --- Data Structure Helpers ---
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // --- Core Operations Logic ---
    const Algebra = {
        select: (relation, conditionStr) => {
            // Parse condition safely (simple eval for demo purposes)
            // Mapping column names to values in the scope
            const cols = relation.columns;
            try {
                const rowFilter = new Function(...cols, `return ${conditionStr};`);
                const newRows = relation.rows.filter(row => {
                    try {
                        return rowFilter(...row);
                    } catch (e) {
                        return false;
                    }
                });
                return { columns: cols, rows: newRows };
            } catch (e) {
                throw new Error("Erreur de syntaxe dans la condition.");
            }
        },

        project: (relation, colListStr) => {
            const cols = colListStr.split(',').map(c => c.trim()).filter(c => c);
            const indices = cols.map(c => relation.columns.indexOf(c));
            
            if (indices.some(i => i === -1)) {
                throw new Error("Certaines colonnes n'existent pas.");
            }

            // Remove duplicates for Project definition (Set semantics)
            const uniqueRows = new Set();
            const newRows = [];

            relation.rows.forEach(row => {
                const projectedRow = indices.map(i => row[i]);
                const key = JSON.stringify(projectedRow);
                if (!uniqueRows.has(key)) {
                    uniqueRows.add(key);
                    newRows.push(projectedRow);
                }
            });

            return { columns: cols, rows: newRows };
        },

        union: (relA, relB) => {
            if (JSON.stringify(relA.columns) !== JSON.stringify(relB.columns)) {
                throw new Error("Les schémas des relations ne sont pas compatibles pour l'Union.");
            }
            const allRows = [...relA.rows, ...relB.rows];
            // Deduplicate
            const unique = new Set();
            const newRows = [];
            allRows.forEach(r => {
                const k = JSON.stringify(r);
                if(!unique.has(k)) {
                    unique.add(k);
                    newRows.push(r);
                }
            });
            return { columns: relA.columns, rows: newRows };
        },

        difference: (relA, relB) => {
            if (JSON.stringify(relA.columns) !== JSON.stringify(relB.columns)) {
                throw new Error("Les schémas des relations ne sont pas compatibles pour la Différence.");
            }
            const setB = new Set(relB.rows.map(r => JSON.stringify(r)));
            const newRows = relA.rows.filter(r => !setB.has(JSON.stringify(r)));
            return { columns: relA.columns, rows: newRows };
        },

        product: (relA, relB) => {
            const newCols = [...relA.columns, ...relB.columns];
            const newRows = [];
            relA.rows.forEach(rowA => {
                relB.rows.forEach(rowB => {
                    newRows.push([...rowA, ...rowB]);
                });
            });
            return { columns: newCols, rows: newRows };
        },

        rename: (relation, newName, newColStr) => {
            if (!newColStr) return { ...relation, name: newName }; // Just rename relation
            
            const newCols = newColStr.split(',').map(c => c.trim());
            if (newCols.length !== relation.columns.length) {
                throw new Error("Le nombre de nouvelles colonnes ne correspond pas.");
            }
            return { columns: newCols, rows: relation.rows, name: newName };
        }
    };

    // --- UI Rendering ---
    function renderTables() {
        const container = document.getElementById('databaseView');
        const allTables = { ...tables }; // Clone to not modify source
        
        if (Object.keys(allTables).length === 0) {
            container.innerHTML = '<div class="empty-state">Aucune table.</div>';
            return;
        }

        let html = '';
        for (const [name, rel] of Object.entries(allTables)) {
            html += `
                <div class="db-table-container">
                    <div class="db-table-header">
                        <span>${rel.name || name}</span>
                        <button class="btn-danger" style="font-size:0.7rem; padding: 2px 6px;" onclick="deleteTable('${name}')">×</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                ${rel.columns.map(c => `<th>${c}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rel.rows.map(row => `
                                <tr>
                                    ${row.map(val => `<td>${val}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    function renderResults() {
        const container = document.getElementById('resultsView');
        if (results.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun résultat.</div>';
            return;
        }

        let html = '';
        results.forEach((res, index) => {
            const badge = res.isBase ? 'Base' : `Res #${index + 1}`;
            html += `
                <div class="result-item">
                    <div class="result-header">
                        <span class="result-title">${res.name}</span>
                        <div style="display:flex; gap:5px; align-items:center;">
                            <span class="badge">${badge}</span>
                            <button class="btn-secondary" style="padding:2px 6px; font-size:0.7rem;" onclick="useResult(${index})" title="Utiliser comme table">➜</button>
                            <button class="btn-danger" style="padding:2px 6px; font-size:0.7rem;" onclick="removeResult(${index})">×</button>
                        </div>
                    </div>
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    ${res.data.columns.map(c => `<th>${c}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${res.data.rows.length === 0 ? '<tr><td colspan="100" style="text-align:center; color:#999; padding:10px;">Vide (∅)</td></tr>' : 
                                  res.data.rows.map(row => `
                                    <tr>
                                        ${row.map(val => `<td>${val}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="font-size:0.75rem; color:var(--secondary); margin-top:5px;">${res.rows.length} ligne(s)</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // --- Interaction Logic ---
    function setOperation(op) {
        currentOp = op;
        document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`btn-${op}`).classList.add('active');
        updateOpForm();
    }

    function getAllRelationNames() {
        // Combine base tables and generated results
        const baseNames = Object.keys(tables);
        const resultNames = results.map((_, i) => `Result_${i+1}`);
        return [...baseNames, ...resultNames];
    }

    function getRelationData(name) {
        if (tables[name]) return tables[name];
        if (name.startsWith('Result_')) {
            const idx = parseInt(name.split('_')[1]) - 1;
            return results[idx].data;
        }
        return null;
    }

    function updateOpForm() {
        const container = document.getElementById('op-form');
        const options = getAllRelationNames().map(n => `<option value="${n}">${n}</option>`).join('');

        let html = '';

        switch(currentOp) {
            case 'select':
                html = `
                    <div class="form-group">
                        <label>Relation (R)</label>
                        <select id="input-rel1">${options}</select>
                    </div>
                    <div class="form-group">
                        <label>Condition (Prédicat)</label>
                        <input type="text" id="input-cond" placeholder="ex: age > 20">
                        <div class="helper-text">Utilisez les noms des colonnes comme variables. Ex: nom == 'Alice' && age < 30</div>
                    </div>
                `;
                break;
            case 'project':
                html = `
                    <div class="form-group">
                        <label>Relation (R)</label>
                        <select id="input-rel1">${options}</select>
                    </div>
                    <div class="form-group">
                        <label>Colonnes (Liste)</label>
                        <input type="text" id="input-cols" placeholder="ex: nom, age">
                    </div>
                `;
                break;
            case 'union':
            case 'difference':
                html = `
                    <div class="form-group">
                        <label>Relation A</label>
                        <select id="input-rel1">${options}</select>
                    </div>
                    <div class="form-group">
                        <label>Relation B</label>
                        <select id="input-rel2">${options}</select>
                    </div>
                `;
                break;
            case 'product':
                html = `
                    <div class="form-group">
                        <label>Relation A</label>
                        <select id="input-rel1">${options}</select>
                    </div>
                    <div class="form-group">
                        <label>Relation B</label>
                        <select id="input-rel2">${options}</select>
                    </div>
                `;
                break;
            case 'rename':
                html = `
                    <div class="form-group">
                        <label>Relation (R)</label>
                        <select id="input-rel1">${options}</select>
                    </div>
                    <div class="form-group">
                        <label>Nouvelle Relation</label>
                        <input type="text" id="input-newrel" placeholder="Nouveau nom (optionnel)">
                    </div>
                    <div class="form-group">
                        <label>Nouveaux Noms Colonnes (optionnel)</label>
                        <input type="text" id="input-newcols" placeholder="ex: id, prenom">
                    </div>
                `;
                break;
        }
        container.innerHTML = html;
    }

    function executeOperation() {
        try {
            let resData;
            let resName = "";

            const getRel = (id) => {
                const name = document.getElementById(id).value;
                return getRelationData(name);
            };

            switch(currentOp) {
                case 'select':
                    const r1 = getRel('input-rel1');
                    const cond = document.getElementById('input-cond').value;
                    if(!cond) throw new Error("Veuillez entrer une condition.");
                    resData = Algebra.select(r1, cond);
                    resName = `σ(${cond})`;
                    break;
                case 'project':
                    const r2 = getRel('input-rel1');
                    const cols = document.getElementById('input-cols').value;
                    if(!cols) throw new Error("Veuillez entrer les colonnes.");
                    resData = Algebra.project(r2, cols);
                    resName = `π(${cols})`;
                    break;
                case 'union':
                    const r3a = getRel('input-rel1');
                    const r3b = getRel('input-rel2');
                    resData = Algebra.union(r3a, r3b);
                    resName = "Union";
                    break;
                case 'difference':
                    const r4a = getRel('input-rel1');
                    const r4b = getRel('input-rel2');
                    resData = Algebra.difference(r4a, r4b);
                    resName = "Différence";
                    break;
                case 'product':
                    const r5a = getRel('input-rel1');
                    const r5b = getRel('input-rel2');
                    resData = Algebra.product(r5a, r5b);
                    resName = "Produit ×";
                    break;
                case 'rename':
                    const r6 = getRel('input-rel1');
                    const newName = document.getElementById('input-newrel').value;
                    const newCols = document.getElementById('input-newcols').value;
                    resData = Algebra.rename(r6, newName, newCols);
                    resName = newName ? newName : "Renommé";
                    break;
            }

            results.unshift({
                name: resName,
                data: resData,
                rows: resData.rows
            });
            
            renderResults();
            showToast("Opération réussie !", "success");

        } catch (err) {
            showToast(err.message, "error");
        }
    }

    // --- Table Management ---
    function openAddTableModal() {
        document.getElementById('newTableName').value = '';
        document.getElementById('newTableCols').value = '';
        document.getElementById('newTableData').value = '';
        document.getElementById('addTableModal').classList.add('open');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('open');
    }

    function createNewTable() {
        const name = document.getElementById('newTableName').value.trim();
        const cols = document.getElementById('newTableCols').value.split(',').map(s => s.trim()).filter(s => s);
        const dataRaw = document.getElementById('newTableData').value.trim();

        if (!name || !cols) {
            showToast("Nom et colonnes requis.", "error");
            return;
        }

        let rows = [];
        try {
            if (dataRaw) {
                rows = JSON.parse(dataRaw);
                if (!Array.isArray(rows)) throw new Error("Doit être une liste de lignes.");
                // Check row length
                if (rows.some(r => r.length !== cols.length)) {
                    throw new Error("Incohérence entre le nombre de colonnes et les données.");
                }
            }
        } catch (e) {
            showToast("Erreur de format JSON dans les données.", "error");
            return;
        }

        tables[name] = { name, columns: cols, rows };
        renderTables();
        updateOpForm(); // Refresh selects
        closeModal('addTableModal');
        showToast("Table créée avec succès.", "success");
    }

    function deleteTable(name) {
        if(confirm(`Supprimer la table ${name} ?`)) {
            delete tables[name];
            renderTables();
            updateOpForm();
        }
    }

    function clearResults() {
        results = [];
        renderResults();
    }

    function removeResult(index) {
        results.splice(index, 1);
        renderResults();
        updateOpForm();
    }
    
    function useResult(index) {
        // Helper to "promote" a result to a base table for easier reuse
        const res = results[index];
        const newName = prompt("Nommer cette table pour la sauvegarder dans la base ?", `T_${res.name.replace(/\W/g,'')}`);
        if(newName) {
            tables[newName] = { ...res.data, name: newName };
            renderTables();
            updateOpForm();
            showToast("Table ajoutée à la base.", "success");
        }
    }

    function resetAll() {
        if(confirm("Tout effacer ?")) {
            tables = {};
            results = [];
            renderTables();
            renderResults();
            updateOpForm();
        }
    }

    function loadExample() {
        tables = {
            "Etudiants": {
                name: "Etudiants",
                columns: ["id", "nom", "age", "filiere"],
                rows: [
                    [1, "Alice", 20, "Info"],
                    [2, "Bob", 22, "Maths"],
                    [3, "Charlie", 21, "Info"],
                    [4, "David", 23, "Physique"]
                ]
            },
            "Cours": {
                name: "Cours",
                columns: ["code", "titre", "filiere"],
                rows: [
                    ["CS101", "Algo", "Info"],
                    ["MATH201", "Stats", "Maths"],
                    ["PHY101", "Mécanique", "Physique"],
                    ["CS202", "BD", "Info"]
                ]
            }
        };
        results = [];
        renderTables();
        renderResults();
        updateOpForm();
        showToast("Exemple chargé.", "success");
    }

    // --- Utils ---
    function showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            event.target.classList.remove('open');
        }
    }

    init();
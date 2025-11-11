class UIManager {
    constructor() {
        this.api = new IntegrationAPI();
        this.currentSection = 'integrations';
    }

    init() {
        this.loadIntegrations();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Formulário de integração
        document.getElementById('integrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIntegrationSubmit();
        });

        // Gerar chave API
        document.getElementById('apiKey').addEventListener('focus', () => {
            this.suggestAPIKey();
        });
    }

    async loadIntegrations() {
        try {
            const response = await this.api.getIntegrations();
            this.displayIntegrations(response.records || []);
        } catch (error) {
            this.showError('Erro ao carregar integrações');
        }
    }

    displayIntegrations(integrations) {
        const container = document.getElementById('integrationsContainer');
        
        if (integrations.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma integração configurada</p>';
            return;
        }

        container.innerHTML = integrations.map(integration => `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">${integration.name}</div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="uiManager.testIntegration(${integration.id})">
                            <i class="fas fa-test"></i> Testar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="uiManager.deleteIntegration(${integration.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p><strong>Endpoint:</strong> ${integration.api_endpoint}</p>
                    <p><strong>Chave API:</strong> ${integration.api_key ? '••••••••' : 'Não configurada'}</p>
                    <p><strong>Criado em:</strong> ${new Date(integration.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    async handleIntegrationSubmit() {
        const formData = {
            name: document.getElementById('integrationName').value,
            api_endpoint: document.getElementById('apiEndpoint').value,
            api_key: document.getElementById('apiKey').value,
            config: JSON.parse(document.getElementById('integrationConfig').value || '{}')
        };

        try {
            await this.api.createIntegration(formData);
            this.showSuccess('Integração criada com sucesso!');
            this.loadIntegrations();
            this.resetForm();
        } catch (error) {
            this.showError('Erro ao criar integração');
        }
    }

    async testIntegration(id) {
        try {
            const integrations = await this.api.getIntegrations();
            const integration = integrations.records.find(i => i.id === id);
            
            if (integration) {
                const isConnected = await this.api.testConnection(
                    integration.api_endpoint, 
                    integration.api_key
                );
                
                if (isConnected) {
                    this.showSuccess('Conexão testada com sucesso!');
                } else {
                    this.showError('Falha na conexão com a API');
                }
            }
        } catch (error) {
            this.showError('Erro ao testar integração');
        }
    }

    async deleteIntegration(id) {
        if (confirm('Tem certeza que deseja excluir esta integração?')) {
            try {
                await this.api.deleteIntegration(id);
                this.showSuccess('Integração excluída com sucesso!');
                this.loadIntegrations();
            } catch (error) {
                this.showError('Erro ao excluir integração');
            }
        }
    }

    async loadData(source) {
        try {
            const data = await this.api.getCorporateData(source);
            this.displayData(source, data);
        } catch (error) {
            this.showError('Erro ao carregar dados');
        }
    }

    displayData(source, data) {
        const container = document.getElementById('dataDisplay');
        let transformedData;
        let tableHeaders = [];
        let tableData = [];

        switch(source) {
            case 'crm':
                transformedData = DataTransformer.transformCRMData(data);
                tableHeaders = ['ID', 'Nome', 'Empresa', 'Status'];
                tableData = transformedData.detailed;
                break;
            case 'erp':
                transformedData = DataTransformer.transformERPData(data);
                tableHeaders = ['Produto', 'Estoque', 'Estoque Mínimo'];
                tableData = transformedData.detailed;
                break;
            case 'hr':
                transformedData = DataTransformer.transformHRData(data);
                tableHeaders = ['ID', 'Nome', 'Departamento', 'Cargo'];
                tableData = transformedData.detailed;
                break;
        }

        container.innerHTML = `
            <div class="stats-grid">
                ${Object.entries(transformedData.summary).map(([key, value]) => `
                    <div class="stat-card">
                        <div class="stat-number">${value}</div>
                        <div class="stat-label">${this.formatLabel(key)}</div>
                    </div>
                `).join('')}
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableData.map(item => `
                        <tr>
                            ${Object.values(item).map(value => `<td>${value}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    formatLabel(key) {
        const labels = {
            'totalContacts': 'Total de Contatos',
            'totalDeals': 'Total de Negócios',
            'activeLeads': 'Leads Ativos',
            'lowStock': 'Produtos com Estoque Baixo',
            'pendingOrders': 'Pedidos Pendentes',
            'totalInventory': 'Total de Produtos',
            'totalEmployees': 'Total de Funcionários',
            'totalDepartments': 'Total de Departamentos',
            'openVacancies': 'Vagas Abertas'
        };
        return labels[key] || key;
    }

    suggestAPIKey() {
        const keyField = document.getElementById('apiKey');
        if (!keyField.value) {
            keyField.value = SecurityManager.generateAPIKey();
        }
    }

    resetForm() {
        document.getElementById('integrationForm').reset();
    }

    showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção selecionada
        document.getElementById(sectionId).classList.add('active');
        this.currentSection = sectionId;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Instância global do gerenciador de UI
const uiManager = new UIManager();
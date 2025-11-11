class IntegrationAPI {
    constructor() {
        this.baseURL = 'http://localhost/integration-system/backend/api';
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // CRUD para integrações
    async getIntegrations() {
        return await this.request('integration.php', { method: 'GET' });
    }

    async createIntegration(integration) {
        return await this.request('integration.php', {
            method: 'POST',
            body: JSON.stringify(integration)
        });
    }

    async updateIntegration(integration) {
        return await this.request('integration.php', {
            method: 'PUT',
            body: JSON.stringify(integration)
        });
    }

    async deleteIntegration(id) {
        return await this.request('integration.php', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }

    // Buscar dados dos sistemas corporativos
    async getCorporateData(source) {
        return await this.request(`data.php?source=${source}`, { method: 'GET' });
    }

    // Testar conexão com API externa
    async testConnection(endpoint, apiKey) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

class DataTransformer {
    static transformCRMData(data) {
        return {
            summary: {
                totalContacts: data.contacts,
                totalDeals: data.deals,
                activeLeads: data.leads.length
            },
            detailed: data.leads
        };
    }

    static transformERPData(data) {
        return {
            summary: {
                lowStock: data.inventory.filter(item => item.stock < item.min_stock).length,
                pendingOrders: data.orders.pending,
                totalInventory: data.inventory.length
            },
            detailed: data.inventory
        };
    }

    static transformHRData(data) {
        return {
            summary: {
                totalEmployees: data.employees.length,
                totalDepartments: data.departments,
                openVacancies: data.vacancies
            },
            detailed: data.employees
        };
    }
}

class SecurityManager {
    static encryptAPIKey(apiKey) {
        // Simulação de criptografia - em produção usar biblioteca adequada
        return btoa(apiKey);
    }

    static decryptAPIKey(encryptedKey) {
        return atob(encryptedKey);
    }

    static validateEndpoint(endpoint) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(endpoint);
    }

    static generateAPIKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }
}
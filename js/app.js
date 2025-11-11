// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    uiManager.init();
});

// Funções globais para os botões
function showSection(sectionId) {
    uiManager.showSection(sectionId);
}

function loadData(source) {
    uiManager.loadData(source);
}

function generateAPI() {
    const apiName = document.getElementById('apiName').value;
    const dataSources = Array.from(document.getElementById('dataSources').selectedOptions)
        .map(option => option.value);
    const endpointType = document.getElementById('endpointType').value;
    const securityLevel = document.getElementById('securityLevel').value;

    if (!apiName || dataSources.length === 0) {
        uiManager.showError('Preencha todos os campos obrigatórios');
        return;
    }

    const generatedCode = generateAPICode(apiName, dataSources, endpointType, securityLevel);
    
    document.getElementById('generatedCode').textContent = generatedCode;
    document.getElementById('apiOutput').style.display = 'block';
}

function generateAPICode(name, sources, type, security) {
    return `<?php
/**
 * API Gerada: ${name}
 * Fontes: ${sources.join(', ')}
 * Tipo: ${type}
 * Segurança: ${security}
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
${security !== 'basic' ? 'header("Access-Control-Allow-Headers: Authorization, Content-Type");' : ''}

class GeneratedAPI {
    private \$validTokens = ["your-generated-token-here"];
    
    public function authenticate() {
        ${this.getSecurityCode(security)}
    }
    
    public function getData(\$sources) {
        \$data = [];
        ${sources.map(source => `
        if (in_array("${source}", \$sources)) {
            \$data["${source}"] = \$this->get${source.toUpperCase()}Data();
        }`).join('')}
        return \$data;
    }
    
    ${sources.map(source => `
    private function get${source.toUpperCase()}Data() {
        // Implementação para ${source}
        return [
            "message" => "Dados de ${source}",
            "timestamp" => time()
        ];
    }`).join('')}
}

\$api = new GeneratedAPI();
if (\$api->authenticate()) {
    \$sources = \$_GET['sources'] ? explode(',', \$_GET['sources']) : ${JSON.stringify(sources)};
    echo json_encode(\$api->getData(\$sources));
} else {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
}
?>`;
}

function getSecurityCode(securityLevel) {
    switch(securityLevel) {
        case 'jwt':
            return `
        \$headers = getallheaders();
        if (!isset(\$headers['Authorization'])) {
            http_response_code(401);
            return false;
        }
        
        \$token = str_replace('Bearer ', '', \$headers['Authorization']);
        // Validar JWT token aqui
        return in_array(\$token, \$this->validTokens);`;
        
        case 'oauth':
            return `
        // Implementação OAuth 2.0
        session_start();
        if (!isset(\$_SESSION['oauth_token'])) {
            http_response_code(401);
            return false;
        }
        return true;`;
        
        default: // basic
            return `
        \$apiKey = \$_GET['api_key'] ?? '';
        return in_array(\$apiKey, \$this->validTokens);`;
    }
}

function downloadAPI() {
    const code = document.getElementById('generatedCode').textContent;
    const blob = new Blob([code], { type: 'application/php' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_api.php';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    uiManager.showSuccess('API baixada com sucesso!');
}
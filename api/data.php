<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Simulação de dados corporativos de diferentes sistemas
class CorporateData {
    public function getCRMData() {
        return array(
            "leads" => array(
                array("id" => 1, "name" => "João Silva", "company" => "Tech Corp", "status" => "new"),
                array("id" => 2, "name" => "Maria Santos", "company" => "Inova Ltda", "status" => "contacted"),
                array("id" => 3, "name" => "Pedro Costa", "company" => "Global Solutions", "status" => "qualified")
            ),
            "contacts" => 45,
            "deals" => 12
        );
    }

    public function getERPData() {
        return array(
            "inventory" => array(
                array("product" => "Notebook", "stock" => 150, "min_stock" => 50),
                array("product" => "Mouse", "stock" => 300, "min_stock" => 100),
                array("product" => "Teclado", "stock" => 200, "min_stock" => 80)
            ),
            "orders" => array(
                "pending" => 8,
                "processing" => 15,
                "shipped" => 22
            )
        );
    }

    public function getHRData() {
        return array(
            "employees" => array(
                array("id" => 1, "name" => "Carlos Lima", "department" => "TI", "position" => "Desenvolvedor"),
                array("id" => 2, "name" => "Ana Souza", "department" => "RH", "position" => "Recrutadora"),
                array("id" => 3, "name" => "Roberto Alves", "department" => "Vendas", "position" => "Gerente")
            ),
            "departments" => 6,
            "vacancies" => 3
        );
    }
}

$dataSource = $_GET['source'] ?? 'crm';
$corporateData = new CorporateData();

switch($dataSource) {
    case 'crm':
        $data = $corporateData->getCRMData();
        break;
    case 'erp':
        $data = $corporateData->getERPData();
        break;
    case 'hr':
        $data = $corporateData->getHRData();
        break;
    default:
        $data = $corporateData->getCRMData();
}

http_response_code(200);
echo json_encode($data);
?>
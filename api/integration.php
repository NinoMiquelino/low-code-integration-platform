<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/IntegrationModel.php';

$database = new Database();
$db = $database->getConnection();
$integration = new IntegrationModel($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $integration->read();
        $num = $stmt->rowCount();

        if($num > 0) {
            $integrations_arr = array();
            $integrations_arr["records"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $integration_item = array(
                    "id" => $id,
                    "name" => $name,
                    "api_endpoint" => $api_endpoint,
                    "api_key" => $api_key,
                    "config" => $config,
                    "created_at" => $created_at
                );
                array_push($integrations_arr["records"], $integration_item);
            }
            http_response_code(200);
            echo json_encode($integrations_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "No integrations found."));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->name) && !empty($data->api_endpoint)) {
            $integration->name = $data->name;
            $integration->api_endpoint = $data->api_endpoint;
            $integration->api_key = $data->api_key ?? '';
            $integration->config = json_encode($data->config ?? []);

            if($integration->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Integration created successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create integration."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create integration. Data is incomplete."));
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $integration->id = $data->id;

        if(!empty($data->name) && !empty($data->api_endpoint)) {
            $integration->name = $data->name;
            $integration->api_endpoint = $data->api_endpoint;
            $integration->api_key = $data->api_key ?? '';
            $integration->config = json_encode($data->config ?? []);

            if($integration->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Integration updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update integration."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update integration. Data is incomplete."));
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        $integration->id = $data->id;

        if($integration->delete()) {
            http_response_code(200);
            echo json_encode(array("message" => "Integration deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete integration."));
        }
        break;
}
?>
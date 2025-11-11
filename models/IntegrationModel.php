<?php
class IntegrationModel {
    private $conn;
    private $table_name = "integrations";

    public $id;
    public $name;
    public $api_endpoint;
    public $api_key;
    public $config;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET name=:name, api_endpoint=:api_endpoint, api_key=:api_key, config=:config";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->api_endpoint = htmlspecialchars(strip_tags($this->api_endpoint));
        $this->api_key = htmlspecialchars(strip_tags($this->api_key));
        $this->config = htmlspecialchars(strip_tags($this->config));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":api_endpoint", $this->api_endpoint);
        $stmt->bindParam(":api_key", $this->api_key);
        $stmt->bindParam(":config", $this->config);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                SET name=:name, api_endpoint=:api_endpoint, api_key=:api_key, config=:config
                WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->api_endpoint = htmlspecialchars(strip_tags($this->api_endpoint));
        $this->api_key = htmlspecialchars(strip_tags($this->api_key));
        $this->config = htmlspecialchars(strip_tags($this->config));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":api_endpoint", $this->api_endpoint);
        $stmt->bindParam(":api_key", $this->api_key);
        $stmt->bindParam(":config", $this->config);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>
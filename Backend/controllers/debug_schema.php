<?php
include_once '../config/connection.php';

function describeTable($conn, $table) {
    if ($result = $conn->query("DESCRIBE $table")) {
        echo "Structure of $table:\n";
        while ($row = $result->fetch_assoc()) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
        echo "\n";
    }
}

describeTable($conn, 'doctors');
describeTable($conn, 'payments');
describeTable($conn, 'users');
?>

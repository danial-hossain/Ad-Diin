<?php
$host = '127.0.0.1';
$db = 'addiin';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    
    // Check if tables exist
    $tables = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'addiin'")->fetchAll();
    $table_names = array_column($tables, 'TABLE_NAME');
    
    echo "✅ Database Tables:\n";
    foreach ($table_names as $table) {
        echo "  - $table\n";
    }
    
    if (in_array('conversations', $table_names)) {
        echo "\n✅ conversations table EXISTS\n";
        $cols = $pdo->query("DESCRIBE conversations")->fetchAll();
        echo "  Columns: " . implode(', ', array_column($cols, 'Field')) . "\n";
    }
    
    if (in_array('messages', $table_names)) {
        echo "\n✅ messages table EXISTS\n";
        $cols = $pdo->query("DESCRIBE messages")->fetchAll();
        echo "  Columns: " . implode(', ', array_column($cols, 'Field')) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

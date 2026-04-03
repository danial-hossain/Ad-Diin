<?php
// Setup database tables
$host = '127.0.0.1';
$db = 'addiin';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL to create tables
    $sql = <<<SQL
    -- Create conversations table
    CREATE TABLE IF NOT EXISTS conversations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        admin_id BIGINT UNSIGNED NULL,
        subject VARCHAR(255) NULL,
        status ENUM('active', 'closed', 'pending') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_admin_id (admin_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Create messages table
    CREATE TABLE IF NOT EXISTS messages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        conversation_id BIGINT UNSIGNED NOT NULL,
        sender_id BIGINT UNSIGNED NOT NULL,
        message LONGTEXT,
        sender_type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_conversation_id (conversation_id),
        INDEX idx_sender_id (sender_id),
        INDEX idx_is_read (is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Add foreign keys if tables exist
    ALTER TABLE conversations 
    ADD CONSTRAINT conversations_user_id_foreign 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE conversations 
    ADD CONSTRAINT conversations_admin_id_foreign 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

    ALTER TABLE messages 
    ADD CONSTRAINT messages_conversation_id_foreign 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

    ALTER TABLE messages 
    ADD CONSTRAINT messages_sender_id_foreign 
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
    SQL;

    // Execute each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "✓ Executed: " . substr($statement, 0, 50) . "...\n";
            } catch (Exception $e) {
                // Foreign key might already exist, that's okay
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "⚠ " . $e->getMessage() . "\n";
                }
            }
        }
    }

    echo "\n✅ Database tables created/verified successfully!\n";

} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>

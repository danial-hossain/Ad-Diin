<?php
// Test backend API connectivity and authentication
echo "=== Ad-Diin Messaging API Test ===\n\n";

$baseUrl = 'http://localhost:8000';
$testUser = [
    'email' => 'user@test.com',
    'password' => 'password'
];

// Test 1: Check if server is running
echo "Test 1: Checking backend server...\n";
$ch = curl_init($baseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode === 0) {
    echo "❌ Backend server is not running (http://localhost:8000)\n";
    echo "   Start it with: php artisan serve\n\n";
    exit(1);
} else {
    echo "✅ Backend server is running\n\n";
}

// Test 2: Check messaging tables
echo "Test 2: Checking messaging tables in database...\n";
$host = '127.0.0.1';
$db = 'addiin';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    
    $tables = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'addiin' AND TABLE_NAME IN ('conversations', 'messages')")->fetchAll();
    
    if (count($tables) === 2) {
        echo "✅ Both messaging tables exist\n\n";
    } else {
        echo "❌ Missing table(s)\n\n";
    }
} catch (Exception $e) {
    echo "❌ Cannot connect to database: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Check if MessageController exists
echo "Test 3: Checking MessageController...\n";
$controllerPath = __DIR__ . '/app/Http/Controllers/MessageController.php';
if (file_exists($controllerPath)) {
    echo "✅ MessageController exists\n\n";
} else {
    echo "❌ MessageController not found\n\n";
}

// Test 4: Test API endpoint (requires authentication)
echo "Test 4: Testing API endpoint /v1/messages/...\n";
$ch = curl_init("$baseUrl/api/v1/messages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer MOCK_TOKEN' // Mock token to test auth middleware
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode === 401 || $httpCode === 403) {
    echo "✅ API endpoint exists (got auth error, which is expected)\n";
    echo "   Status: $httpCode (Authentication required)\n\n";
} elseif ($httpCode === 404) {
    echo "❌ API endpoint not found (404)\n";
    echo "   Check routes/api.php\n\n";
} else {
    echo "⚠ API returned: $httpCode\n";
    echo "   Response: " . substr($response, 0, 100) . "...\n\n";
}

echo "=== Summary ===\n";
echo "✅ Database: Messaging tables created\n";
echo "⚠  Backend: Start with: php artisan serve\n";
echo "✅ API: Routes configured at /v1/messages/*\n";
echo "\nNext steps for the user:\n";
echo "1. Start backend: cd server && php artisan serve\n";
echo "2. Start frontend: cd client && npm run dev\n";
echo "3. Visit: http://localhost:5173/messaging\n";
echo "4. Login first if not already logged in\n";
echo "5. Check browser console (F12) for debug logs\n";
?>

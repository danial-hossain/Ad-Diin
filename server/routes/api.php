<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\MiladController;
use App\Http\Controllers\IslamicEventController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AboutContentController;


// ── Public Routes ─────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });
    Route::post('/ai/chat',         [AIController::class, 'chat']);
    Route::post('/ai/chat/history', [AIController::class, 'chatWithHistory']);
    Route::get('/ai/status',        [AIController::class, 'status']);
    Route::get('/prayer-times',        [PrayerTimeController::class, 'index']);
    Route::get('/prayer-times/jamaat', [PrayerTimeController::class, 'getJamaatTimes']);
    Route::get('/prayer-times/azan',   [PrayerTimeController::class, 'getAzanTimes']);
    Route::get('/prayer-times/nafl',   [PrayerTimeController::class, 'getNaflPrayers']);
    Route::get('/prayer-times/{id}',   [PrayerTimeController::class, 'show']);
    Route::get('/milads',              [MiladController::class, 'index']);
    Route::get('/milads/create-form',  [MiladController::class, 'create']);
    Route::prefix('events')->group(function () {
        Route::get('/upcoming', [IslamicEventController::class, 'upcoming']);
        Route::get('/all',      [IslamicEventController::class, 'all']);
        Route::get('/today',    [IslamicEventController::class, 'today']);
        Route::get('/{id}',     [IslamicEventController::class, 'show']);
    });
    Route::get('/donation/{tranId}', [PaymentController::class, 'getDonation']);

    // ✅ Contact: public — login ছাড়াই submit করা যাবে
    Route::post('/contact', [ContactController::class, 'submit']);
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/about', [AboutContentController::class, 'show']);
    Route::put('/about', [AboutContentController::class, 'update']);
});

// ── Payment Callback Routes ───────────────────────────────
Route::prefix('v1/payment')->group(function () {
    Route::match(['get', 'post'], '/success', [PaymentController::class, 'success']);
    Route::match(['get', 'post'], '/fail',    [PaymentController::class, 'fail']);
    Route::match(['get', 'post'], '/cancel',  [PaymentController::class, 'cancel']);
    Route::post('/ipn',                       [PaymentController::class, 'ipn']);
});

// ── Protected Routes ──────────────────────────────────────
Route::prefix('v1')->middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
    Route::prefix('user')->group(function () {
        Route::put('/update',           [AuthController::class, 'update']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/milads',           [MiladController::class, 'userRequests']);
    });
    Route::prefix('milads')->group(function () {
        Route::post('/',            [MiladController::class, 'store']);
        Route::get('/{milad}',      [MiladController::class, 'show']);
        Route::get('/{milad}/edit', [MiladController::class, 'edit']);
        Route::put('/{milad}',      [MiladController::class, 'update']);
        Route::delete('/{milad}',   [MiladController::class, 'destroy']);
    });

    Route::prefix('payment')->group(function () {
        Route::post('/initiate',      [PaymentController::class, 'initiate']);
        Route::get('/user/donations', [PaymentController::class, 'userDonations']);
    });

    // ── Messaging Routes ──────────────────────────────────
    Route::prefix('messages')->group(function () {
        Route::get('/',                              [MessageController::class, 'getConversations']);
        Route::get('/unread',                        [MessageController::class, 'getUnreadCount']);
        Route::post('/create',                       [MessageController::class, 'getOrCreateConversation']);
        Route::get('/{conversation_id}',             [MessageController::class, 'getMessages']);
        Route::post('/{conversation_id}/send',       [MessageController::class, 'sendMessage']);
        Route::patch('/{conversation_id}/close',     [MessageController::class, 'closeConversation']);
    });

    // ── Admin Routes ──────────────────────────────────────
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Prayer Times
        Route::post('/prayer-times',              [PrayerTimeController::class, 'store']);
        Route::put('/prayer-times/{id}',          [PrayerTimeController::class, 'update']);
        Route::delete('/prayer-times/{id}',       [PrayerTimeController::class, 'destroy']);
        Route::patch('/prayer-times/{id}/toggle', [PrayerTimeController::class, 'toggleActive']);
        Route::post('/prayer-times/order',        [PrayerTimeController::class, 'updateOrder']);

        // Milad
        Route::get('/milads',                  [MiladController::class, 'adminIndex']);
        Route::patch('/milads/{milad}/status', [MiladController::class, 'updateStatus']);

        // Users
        Route::get('/users',         [UserController::class, 'index']);
        Route::get('/users/{id}',    [UserController::class, 'show']);
        Route::put('/users/{id}',    [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Events
        Route::prefix('events')->group(function () {
            Route::post('/',       [IslamicEventController::class, 'store']);
            Route::put('/{id}',    [IslamicEventController::class, 'update']);
            Route::delete('/{id}', [IslamicEventController::class, 'destroy']);
        });

        // Donations
        Route::get('/donations', [PaymentController::class, 'adminDonations']);

        // ✅ Contact admin routes — admin middleware এর ভেতরে
        Route::get('/contact',              [ContactController::class, 'index']);
        Route::patch('/contact/{id}/read',  [ContactController::class, 'markRead']);
        Route::post('/contact/{id}/reply',  [ContactController::class, 'reply']);
        Route::delete('/contact/{id}',      [ContactController::class, 'destroy']);

        Route::put('/about', [AboutContentController::class, 'update']);

 // ── Activities ──────────────────────────────────────
 Route::prefix('activities')->group(function () {
    Route::get('/',        [ActivityController::class, 'adminIndex']);
    Route::post('/',       [ActivityController::class, 'store']);
    Route::put('/{id}',    [ActivityController::class, 'update']);
    Route::delete('/{id}', [ActivityController::class, 'destroy']);
});
});  // closes admin middleware group
});      // closes auth:api middleware group

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toDateTimeString()]);
});

Route::prefix('v1/verify')->group(function () {
    Route::post('/send-code',   [VerificationController::class, 'sendCode']);
    Route::post('/verify-code', [VerificationController::class, 'verifyCode']);
    Route::post('/resend-code', [VerificationController::class, 'resendCode']);
});

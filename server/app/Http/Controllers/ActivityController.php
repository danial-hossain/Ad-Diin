<?php

// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: app/Http/Controllers/ActivityController.php
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class ActivityController extends Controller
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);
    }

    // Public: GET /api/v1/activities
    public function index()
    {
        $activities = Activity::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $activities]);
    }

    // Admin: GET /api/v1/admin/activities
    public function adminIndex()
    {
        $activities = Activity::orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $activities]);
    }

    // Admin: POST /api/v1/admin/activities
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'nullable|image|max:5120', // 5MB max
            'category'    => 'nullable|string|max:100',
            'is_active'   => 'nullable',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl      = null;
        $imagePublicId = null;

        if ($request->hasFile('image')) {
            $uploadedFile = $this->cloudinary->uploadApi()->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder'         => 'activities',
                    'transformation' => [['quality' => 'auto', 'fetch_format' => 'auto']],
                ]
            );
            $imageUrl      = $uploadedFile['secure_url'];
            $imagePublicId = $uploadedFile['public_id'];
        }

        $activity = Activity::create([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN),
            'display_order'   => $request->display_order ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $activity], 201);
    }

    // Admin: POST /api/v1/admin/activities/{id} (with X-HTTP-Method-Override: PUT)
    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'image'         => 'nullable|image|max:5120',
            'category'      => 'nullable|string|max:100',
            'is_active'     => 'nullable',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl      = $activity->image_url;
        $imagePublicId = $activity->image_public_id;

        if ($request->hasFile('image')) {
            // Delete old image from Cloudinary
            if ($activity->image_public_id) {
                try {
                    $this->cloudinary->uploadApi()->destroy($activity->image_public_id);
                } catch (\Exception $e) {
                    // Log but don't fail
                }
            }

            $uploadedFile = $this->cloudinary->uploadApi()->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder'         => 'activities',
                    'transformation' => [['quality' => 'auto', 'fetch_format' => 'auto']],
                ]
            );
            $imageUrl      = $uploadedFile['secure_url'];
            $imagePublicId = $uploadedFile['public_id'];
        }

        $activity->update([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN),
            'display_order'   => $request->display_order ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $activity]);
    }

    // Admin: DELETE /api/v1/admin/activities/{id}
    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);

        // Delete image from Cloudinary
        if ($activity->image_public_id) {
            try {
                $this->cloudinary->uploadApi()->destroy($activity->image_public_id);
            } catch (\Exception $e) {
                // Log but don't fail
            }
        }

        $activity->delete();

        return response()->json(['success' => true, 'message' => 'Activity deleted']);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: app/Models/Activity.php
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'image_public_id',
        'category',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: routes/api.php — add these routes
// ─────────────────────────────────────────────────────────────────────────────

// Public route
Route::get('/activities', [ActivityController::class, 'index']);

// Admin routes (inside your auth:sanctum + admin middleware group)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // ... your existing admin routes ...

    Route::get('/admin/activities',         [ActivityController::class, 'adminIndex']);
    Route::post('/admin/activities',        [ActivityController::class, 'store']);
    Route::post('/admin/activities/{id}',   [ActivityController::class, 'update']);   // X-HTTP-Method-Override: PUT
    Route::delete('/admin/activities/{id}', [ActivityController::class, 'destroy']);
});


// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: .env — add these (already provided by you):
// ─────────────────────────────────────────────────────────────────────────────

// CLOUDINARY_CLOUD_NAME=dhmlstusr
// CLOUDINARY_API_KEY=164873891591645
// CLOUDINARY_API_SECRET=3tt_B7eQQmAVi5BRRDsg0EBZPMg


// ─────────────────────────────────────────────────────────────────────────────
// FILE 5: Install Cloudinary SDK via Composer
// ─────────────────────────────────────────────────────────────────────────────

// Run in your Laravel project root:
// composer require cloudinary-labs/cloudinary-laravel
//
// Then publish config:
// php artisan vendor:publish --provider="CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider"
//
// Alternative (pure PHP SDK without Laravel wrapper):
// composer require cloudinary/cloudinary_php
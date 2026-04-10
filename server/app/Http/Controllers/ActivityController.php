<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class ActivityController extends Controller
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME', 'dhmlstusr'),
                'api_key'    => env('CLOUDINARY_API_KEY', '164873891591645'),
                'api_secret' => env('CLOUDINARY_API_SECRET', '3tt_B7eQQmAVi5BRRDsg0EBZPMg'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);
    }

    public function index()
    {
        $activities = Activity::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $activities]);
    }

    public function adminIndex()
    {
        $activities = Activity::orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $activities]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'nullable|image|max:5120',
            'category'    => 'nullable|string|max:100',
            'is_active'   => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl = null;
        $imagePublicId = null;

        if ($request->hasFile('image')) {
            try {
                $uploadedFile = $this->cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    ['folder' => 'activities']
                );
                $imageUrl = $uploadedFile['secure_url'];
                $imagePublicId = $uploadedFile['public_id'];
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => 'Image upload failed: ' . $e->getMessage()], 500);
            }
        }

        $activity = Activity::create([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => $request->is_active ?? true,
            'display_order'   => $request->display_order ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $activity], 201);
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'image'         => 'nullable|image|max:5120',
            'category'      => 'nullable|string|max:100',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl = $activity->image_url;
        $imagePublicId = $activity->image_public_id;

        if ($request->hasFile('image')) {
            // Delete old image
            if ($activity->image_public_id) {
                try {
                    $this->cloudinary->uploadApi()->destroy($activity->image_public_id);
                } catch (\Exception $e) {}
            }

            try {
                $uploadedFile = $this->cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    ['folder' => 'activities']
                );
                $imageUrl = $uploadedFile['secure_url'];
                $imagePublicId = $uploadedFile['public_id'];
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => 'Image upload failed: ' . $e->getMessage()], 500);
            }
        }

        $activity->update([
            'title'           => $request->title,
            'description'     => $request->description,
            'image_url'       => $imageUrl,
            'image_public_id' => $imagePublicId,
            'category'        => $request->category,
            'is_active'       => $request->is_active ?? $activity->is_active,
            'display_order'   => $request->display_order ?? $activity->display_order,
        ]);

        return response()->json(['success' => true, 'data' => $activity]);
    }

    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);

        if ($activity->image_public_id) {
            try {
                $this->cloudinary->uploadApi()->destroy($activity->image_public_id);
            } catch (\Exception $e) {}
        }

        $activity->delete();

        return response()->json(['success' => true, 'message' => 'Activity deleted']);
    }
}
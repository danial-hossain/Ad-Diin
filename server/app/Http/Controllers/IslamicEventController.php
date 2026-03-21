<?php

namespace App\Http\Controllers;

use App\Models\IslamicEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IslamicEventController extends Controller
{
    /**
     * আসন্ন ইভেন্ট (Public)
     */
    public function upcoming()
    {
        try {
            $events = IslamicEvent::where('event_date', '>=', now())
                                  ->where('is_active', true)
                                  ->orderBy('event_date')
                                  ->get()
                                  ->map(function ($event) {
                                      $event->days_remaining = now()->diffInDays($event->event_date, false);
                                      return $event;
                                  });

            return response()->json(['success' => true, 'data' => $events]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * সব ইভেন্ট (Public)
     */
    public function all()
    {
        try {
            $events = IslamicEvent::where('is_active', true)
                                  ->orderBy('event_date')
                                  ->get()
                                  ->map(function ($event) {
                                      $event->days_remaining = now()->diffInDays($event->event_date, false);
                                      return $event;
                                  });

            return response()->json(['success' => true, 'data' => $events]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * আজকের ইভেন্ট (Public)
     */
    public function today()
    {
        try {
            $events = IslamicEvent::whereDate('event_date', today())
                                  ->where('is_active', true)
                                  ->orderBy('display_order')
                                  ->get();

            return response()->json(['success' => true, 'data' => $events]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * একটি নির্দিষ্ট ইভেন্ট (Public)
     */
    public function show(int $id)
    {
        try {
            $event = IslamicEvent::find($id);

            if (!$event) {
                return response()->json(['success' => false, 'message' => 'ইভেন্ট পাওয়া যায়নি'], 404);
            }

            return response()->json(['success' => true, 'data' => $event]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * নতুন ইভেন্ট তৈরি (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_name'    => 'required|string|max:255',
            'event_date'    => 'required|date',
            'hijri_date'    => 'nullable|string|max:100',
            'hijri_month'   => 'nullable|string|max:50',
            'hijri_day'     => 'nullable|integer',
            'event_type'    => 'required|in:special,religious,festival,historical',
            'description'   => 'nullable|string',
            'is_active'     => 'sometimes|boolean',
            'display_order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $event = IslamicEvent::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'ইভেন্ট সফলভাবে তৈরি হয়েছে',
                'data'    => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ইভেন্ট আপডেট (Admin only)
     */
    public function update(Request $request, int $id)
    {
        $event = IslamicEvent::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'ইভেন্ট পাওয়া যায়নি'], 404);
        }

        $validator = Validator::make($request->all(), [
            'event_name'    => 'sometimes|string|max:255',
            'event_date'    => 'sometimes|date',
            'hijri_date'    => 'nullable|string|max:100',
            'hijri_month'   => 'nullable|string|max:50',
            'hijri_day'     => 'nullable|integer',
            'event_type'    => 'sometimes|in:festival,special,historical,regular',
            'description'   => 'nullable|string',
            'is_active'     => 'sometimes|boolean',
            'display_order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $event->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'ইভেন্ট সফলভাবে আপডেট হয়েছে',
                'data'    => $event->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ইভেন্ট মুছে ফেলা (Admin only)
     */
    public function destroy(int $id)
    {
        $event = IslamicEvent::find($id);

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'ইভেন্ট পাওয়া যায়নি'], 404);
        }

        try {
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
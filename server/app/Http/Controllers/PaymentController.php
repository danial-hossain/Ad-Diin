<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use AfzalSabbir\SSLaraCommerz\Library\SslCommerz\SslCommerzNotification;

class PaymentController extends Controller
{
    protected $sslCommerz;

    public function __construct()
    {
        $this->sslCommerz = new SslCommerzNotification();
    }

    public function initiate(Request $request)
    {
        try {
            $request->validate([
                'category'     => 'required|in:zakat,iftar,durjog,sitarto,gachropon,kurbani,orphan,general',
                'amount'       => 'required|numeric|min:10',
                'name'         => 'required_if:is_anonymous,false|string|max:255',
                'email'        => 'nullable|email',
                'phone'        => 'required|string|max:20',
                'is_anonymous' => 'boolean'
            ]);

            $user   = Auth::user();
            $tranId = 'DON_' . time() . '_' . Str::random(8);

            $donation = Donation::create([
                'user_id'        => $user?->id,
                'name'           => $request->is_anonymous ? null : $request->name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'category'       => $request->category,
                'amount'         => $request->amount,
                'tran_id'        => $tranId,
                'payment_status' => 'pending',
                'is_anonymous'   => $request->is_anonymous ?? false
            ]);

            $customerName  = $request->is_anonymous ? 'Anonymous' : $request->name;
            $customerEmail = $request->email ?? ($user->email ?? 'customer@example.com');
            $customerPhone = $request->phone;

            $categoryNames = [
                'zakat'     => 'Zakat Donation',
                'iftar'     => 'Iftar Donation',
                'durjog'    => 'Disaster Relief Donation',
                'sitarto'   => 'Winter Clothes Donation',
                'gachropon' => 'Tree Plantation Donation',
                'kurbani'   => 'Qurbani Donation',
                'orphan'    => 'Orphan Care Donation',
                'general'   => 'General Donation'
            ];
            $productName = $categoryNames[$request->category] ?? 'Donation';

            $baseUrl  = env('NGROK_URL');
            $postData = [
                'total_amount' => $request->amount,
                'currency'     => 'BDT',
                'tran_id'      => $tranId,
                'success_url'  => $baseUrl . '/api/v1/payment/success?tran_id=' . $tranId,
                'fail_url'     => $baseUrl . '/api/v1/payment/fail?tran_id=' . $tranId,
                'cancel_url'   => $baseUrl . '/api/v1/payment/cancel?tran_id=' . $tranId,
                'ipn_url'      => $baseUrl . '/api/v1/payment/ipn',
                'cus_name'     => $customerName,
                'cus_email'    => $customerEmail,
                'cus_phone'    => $customerPhone,
                'cus_add1'     => 'N/A', 'cus_add2' => 'N/A',
                'cus_city'     => 'Dhaka', 'cus_state' => 'Dhaka',
                'cus_postcode' => '1000', 'cus_country' => 'Bangladesh',
                'ship_name'    => $customerName,
                'ship_add1'    => 'N/A', 'ship_add2' => 'N/A',
                'ship_city'    => 'Dhaka', 'ship_state' => 'Dhaka',
                'ship_postcode'=> '1000', 'ship_country' => 'Bangladesh',
                'product_name'     => $productName,
                'product_category' => $request->category,
                'product_profile'  => 'general',
                'shipping_method'  => 'NO',
                'value_a'          => $user?->id,
                'value_b'          => $request->category,
                'multi_card_name'  => 'mastercard,visacard,amexcard',
                'allowed_bin'      => '371598,371599,376947,376948,376949'
            ];

            Log::info('Sending to SSLCommerz', ['success_url' => $postData['success_url']]);
            $raw = $this->sslCommerz->makePayment($postData, 'checkout', 'json');
            Log::info('SSLCommerz Raw Response', ['response' => $raw]);

            if (is_string($raw)) $paymentOptions = json_decode($raw, true);
            else $paymentOptions = $raw;

            $status     = strtolower($paymentOptions['status'] ?? '');
            $gatewayUrl = $paymentOptions['redirectGatewayURL']
                ?? $paymentOptions['GatewayPageURL']
                ?? (is_string($paymentOptions['data'] ?? null) ? $paymentOptions['data'] : null)
                ?? null;

            if ($status === 'success' && $gatewayUrl) {
                return response()->json(['success' => true, 'gateway_url' => $gatewayUrl, 'tran_id' => $tranId]);
            }

            $donation->payment_status = 'failed';
            $donation->ssl_response   = json_encode($paymentOptions);
            $donation->save();

            return response()->json(['success' => false, 'message' => 'Payment initiation failed', 'error' => $paymentOptions], 500);

        } catch (\Exception $e) {
            Log::error('Payment initiation error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to initiate payment', 'error' => $e->getMessage()], 500);
        }
    }

    public function success(Request $request)
    {
        try {
            $tranId   = $request->tran_id ?? $request->input('tran_id');
            $donation = Donation::where('tran_id', $tranId)->first();
            if (!$donation) return redirect()->away(env('FRONTEND_URL') . '/donate?error=donation_not_found');

            if ($request->status === 'VALID') {
                $donation->payment_status = 'completed';
                $donation->val_id         = $request->val_id;
                $donation->bank_tran_id   = $request->bank_tran_id ?? null;
                $donation->payment_method = $request->card_type ?? 'sslcommerz';
                $donation->ssl_response   = json_encode($request->all());
                $donation->save();
                return redirect()->away(env('FRONTEND_URL') . '/donate/success?tran_id=' . $tranId);
            }

            $donation->payment_status = 'pending';
            $donation->ssl_response   = json_encode($request->all());
            $donation->save();
            return redirect()->away(env('FRONTEND_URL') . '/donate/pending?tran_id=' . $tranId);

        } catch (\Exception $e) {
            Log::error('Payment success error: ' . $e->getMessage());
            return redirect()->away(env('FRONTEND_URL') . '/donate/error');
        }
    }

    public function fail(Request $request)
    {
        try {
            $tranId   = $request->tran_id ?? $request->input('tran_id');
            $donation = Donation::where('tran_id', $tranId)->first();
            if ($donation) {
                $donation->payment_status = 'failed';
                $donation->ssl_response   = json_encode($request->all());
                $donation->save();
            }
            return redirect()->away(env('FRONTEND_URL') . '/donate/fail?tran_id=' . $tranId);
        } catch (\Exception $e) {
            return redirect()->away(env('FRONTEND_URL') . '/donate/error');
        }
    }

    public function cancel(Request $request)
    {
        try {
            $tranId   = $request->tran_id ?? $request->input('tran_id');
            $donation = Donation::where('tran_id', $tranId)->first();
            if ($donation) {
                $donation->payment_status = 'cancelled';
                $donation->ssl_response   = json_encode($request->all());
                $donation->save();
            }
            return redirect()->away(env('FRONTEND_URL') . '/donate/cancel?tran_id=' . $tranId);
        } catch (\Exception $e) {
            return redirect()->away(env('FRONTEND_URL') . '/donate/error');
        }
    }

    public function ipn(Request $request)
    {
        try {
            Log::info('IPN received', $request->all());
            $tranId   = $request->tran_id;
            $donation = Donation::where('tran_id', $tranId)->first();
            if ($donation && $request->status === 'VALID') {
                $donation->payment_status = 'completed';
                $donation->val_id         = $request->val_id;
                $donation->bank_tran_id   = $request->bank_tran_id ?? null;
                $donation->payment_method = $request->card_type ?? 'sslcommerz';
                $donation->ssl_response   = json_encode($request->all());
                $donation->save();
            }
            return response()->json(['status' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'ERROR'], 500);
        }
    }

    /**
     * নিজের donations (User)
     */
    public function userDonations()
    {
        try {
            $user      = Auth::user();
            $paginator = Donation::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data'    => $paginator->items(),
                'meta'    => [
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('User donations error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch donations'], 500);
        }
    }

    /**
     * ✅ সব donations + stats (Admin only)
     */
    public function adminDonations(Request $request)
    {
        try {
            $query = Donation::orderBy('created_at', 'desc');

            if ($request->filled('status')) {
                $query->where('payment_status', $request->status);
            }
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name',     'like', "%{$search}%")
                      ->orWhere('email',   'like', "%{$search}%")
                      ->orWhere('tran_id', 'like', "%{$search}%")
                      ->orWhere('phone',   'like', "%{$search}%");
                });
            }

            $paginator = $query->paginate(50);

            // ✅ Category-wise completed stats (filter নির্বিশেষে সব completed donations এর sum)
            $categoryStats = Donation::where('payment_status', 'completed')
                ->selectRaw('category, SUM(amount) as total_amount, COUNT(*) as count')
                ->groupBy('category')
                ->get()
                ->keyBy('category');

            // ✅ Overall stats
            $totalCompleted = Donation::where('payment_status', 'completed')->sum('amount');
            $totalAll       = Donation::count();
            $totalPending   = Donation::where('payment_status', 'pending')->count();

            return response()->json([
                'success' => true,
                'data'    => $paginator->items(),
                'meta'    => [
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                ],
                // ✅ Stats for dashboard
                'stats' => [
                    'total_completed_amount' => (float) $totalCompleted,
                    'total_count'            => $totalAll,
                    'pending_count'          => $totalPending,
                    'by_category'            => $categoryStats,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Admin donations error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch donations'], 500);
        }
    }

    public function getDonation($tranId)
    {
        try {
            $donation = Donation::where('tran_id', $tranId)->first();
            if (!$donation) return response()->json(['success' => false, 'message' => 'Donation not found'], 404);
            return response()->json(['success' => true, 'data' => $donation]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to fetch donation'], 500);
        }
    }
}
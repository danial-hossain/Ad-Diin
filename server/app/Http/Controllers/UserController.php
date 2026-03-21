<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%");
                });
            }

            // Filter by role
            if ($request->has('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('is_active', $request->status === 'active');
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single user by ID
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
    }

    /**
     * Create new user (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'role' => 'nullable|in:user,admin',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'role' => $request->role ?? 'user',
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user (Admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'role' => 'nullable|in:user,admin',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            // Update only provided fields
            $user->fill($request->only([
                'name', 'email', 'phone', 'address', 'city', 
                'postal_code', 'date_of_birth', 'gender', 'role', 'is_active'
            ]));

            // If password is provided, update it
            if ($request->has('password') && !empty($request->password)) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting the last admin
            if ($user->role === 'admin') {
                $adminCount = User::where('role', 'admin')->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete the last admin user'
                    ], 400);
                }
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user active status (Activate/Deactivate)
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deactivating yourself
            $currentUser = auth()->user();
            if ($currentUser && $currentUser->id == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot deactivate your own account'
                ], 400);
            }

            $user->is_active = !$user->is_active;
            $user->save();

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle user status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user role (Admin only)
     */
    public function updateRole(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:user,admin'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $user = User::findOrFail($id);

            // Prevent changing role of the last admin
            if ($user->role === 'admin' && $request->role !== 'admin') {
                $adminCount = User::where('role', 'admin')->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot demote the last admin user'
                    ], 400);
                }
            }

            $user->role = $request->role;
            $user->save();

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User role updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $userIds = $request->user_ids;
            
            // Prevent deleting admin users
            $adminIds = User::whereIn('id', $userIds)->where('role', 'admin')->pluck('id');
            
            if ($adminIds->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete admin users: ' . $adminIds->join(', ')
                ], 400);
            }

            $deletedCount = User::whereIn('id', $userIds)->delete();

            return response()->json([
                'success' => true,
                'data' => [
                    'deleted_count' => $deletedCount
                ],
                'message' => "{$deletedCount} users deleted successfully"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics for dashboard
     */
    public function getStats()
    {
        try {
            $totalUsers = User::count();
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = User::where('is_active', false)->count();
            $adminUsers = User::where('role', 'admin')->count();
            $regularUsers = User::where('role', 'user')->count();
            
            // Users registered this month
            $thisMonthUsers = User::whereMonth('created_at', now()->month)
                                  ->whereYear('created_at', now()->year)
                                  ->count();
            
            // Users registered last month
            $lastMonthUsers = User::whereMonth('created_at', now()->subMonth()->month)
                                  ->whereYear('created_at', now()->subMonth()->year)
                                  ->count();
            
            $growth = $lastMonthUsers > 0 
                ? round(($thisMonthUsers - $lastMonthUsers) / $lastMonthUsers * 100, 1)
                : 100;

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'inactive' => $inactiveUsers,
                    'admin_count' => $adminUsers,
                    'user_count' => $regularUsers,
                    'new_this_month' => $thisMonthUsers,
                    'growth_percentage' => $growth
                ],
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
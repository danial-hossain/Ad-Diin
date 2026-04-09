<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $table = 'donations';  //  work benche donations table e kaj krteci ekhane  
    protected $primaryKey = 'id'; //   id হলো main key 
    public $timestamps = true;  // created_at, updated_at auto save হবে

    protected $fillable = [ // je je column e data gulo save korbo
        'user_id', 'name', 'email', 'phone',
        'category', 'amount', 'currency',
        'tran_id', 'val_id', 'bank_tran_id',
        'payment_status', 'payment_method',
        'ssl_response', 'notes', 'is_anonymous'
    ];

    protected $casts = [
        'amount' => 'decimal:2',  // type casting hocce ,   100.00 এভাবে দেখাবে
        'is_anonymous' => 'boolean' // // 0/1 কে true/false বানাবে 
        //Database এ সব কিছু string হিসেবে থাকে, cast করলে সঠিক type এ convert হয়।
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);// ekhane amra user tabler sathe relation establish krteci
        //একটা donation একজন user এর। তাই $donation->user লিখলেই সেই user এর সব info পাওয়া যাবে
        //কোন donation কোন user এর সেটা সহজে দেখা যাবে
    }

    // Scopes for filtering
    public function scopeCompleted($query)
    {
        return $query->where('payment_status', 'completed');
        // /শুধু completed donation আনবে
        // database থেকে specific condition দিয়ে data বের করা
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}

// User table theke data  data asle seta controller receive kre,
//ar sei data ta database e kon jayga save hobe seta handle krtece ei donation php data table e save krte,
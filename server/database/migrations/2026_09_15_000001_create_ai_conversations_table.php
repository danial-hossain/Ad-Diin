<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAiConversationsTable extends Migration
{
    public function up()
    {
        if (Schema::hasTable('diin_ai_conversations')) {
            return;
        }

        Schema::create('diin_ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title', 255)->default('New Diin AI chat');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('diin_ai_conversations');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    // ==========================================
    // User message submit
    // ==========================================
    public function submit(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($request->only(['name', 'email', 'company', 'message']));

        // Admin কে নতুন message এর notification পাঠাও
        Mail::send([], [], function ($mail) use ($contact) {
            $mail->to(env('MAIL_USERNAME'))
                 ->subject('New Contact Message from ' . $contact->name)
                 ->setBody(
                     "New message received on Ad-Diin contact form.\n\n" .
                     "Name: {$contact->name}\n" .
                     "Email: {$contact->email}\n" .
                     "Company: {$contact->company}\n\n" .
                     "Message:\n{$contact->message}\n\n" .
                     "---\n" .
                     "Login to admin panel to reply:\n" .
                     env('FRONTEND_URL') . "/admin/messages",
                     'text/plain'
                 );
        });

        // User কে confirmation email পাঠাও
        Mail::send([], [], function ($mail) use ($contact) {
            $mail->to($contact->email)
                 ->subject('We received your message — Ad-Diin')
                 ->setBody(
                     "Assalamu Alaikum {$contact->name},\n\n" .
                     "JazakAllah khair for reaching out to us.\n" .
                     "We have received your message and will respond to you shortly, In sha Allah.\n\n" .
                     "Your message:\n" .
                     "---\n" .
                     "{$contact->message}\n" .
                     "---\n\n" .
                     "Ad-Diin Team\n" .
                     env('FRONTEND_URL'),
                     'text/plain'
                 );
        });

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
        ]);
    }

    // ==========================================
    // Admin: list all messages
    // ==========================================
    public function index()
    {
        $messages = Contact::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    // ==========================================
    // Admin: mark a message as read
    // ==========================================
    public function markRead($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->status = 'read';
        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Marked as read',
        ]);
    }

    // ==========================================
    // Admin: reply to a user via email
    // ==========================================
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_message' => 'required|string',
        ]);

        $contact = Contact::findOrFail($id);

        Mail::send([], [], function ($mail) use ($contact, $request) {
            $mail->to($contact->email)
                 ->from(env('MAIL_FROM_ADDRESS'), 'Ad-Diin Team')
                 ->subject('Reply from Ad-Diin — regarding your message')
                 ->setBody(
                     "Assalamu Alaikum {$contact->name},\n\n" .
                     $request->reply_message . "\n\n" .
                     "---\n" .
                     "This is a reply to your message:\n" .
                     "\"{$contact->message}\"\n\n" .
                     "JazakAllah khair,\n" .
                     "Ad-Diin Team\n" .
                     env('FRONTEND_URL'),
                     'text/plain'
                 );
        });

        // Status update করো replied এ
        $contact->status = 'replied';
        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Reply sent to ' . $contact->email,
        ]);
    }

    // ==========================================
    // Admin: delete a message
    // ==========================================
    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted',
        ]);
    }
}

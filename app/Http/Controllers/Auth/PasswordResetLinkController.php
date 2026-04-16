<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        if ($this->isProductionMailerMisconfigured()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le service e-mail n est pas configure. Contactez l administrateur.',
            ], 503);
        }

        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );
        } catch (\Throwable $exception) {
            \Log::error('Password reset email delivery failed', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Service e-mail temporairement indisponible. Reessayez plus tard.',
            ], 503);
        }

        if (in_array($status, [Password::RESET_LINK_SENT, Password::INVALID_USER], true)) {
            return response()->json([
                'status' => 'ok',
                'message' => 'Si cette adresse e-mail existe dans notre systeme, un lien de reinitialisation vient d etre envoye.',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    private function isProductionMailerMisconfigured(): bool
    {
        if (! app()->environment('production')) {
            return false;
        }

        $mailer = (string) config('mail.default', '');

        if (in_array($mailer, ['log', 'array'], true)) {
            return true;
        }

        if ($mailer === 'smtp') {
            $host = trim((string) config('mail.mailers.smtp.host', ''));
            $port = (int) config('mail.mailers.smtp.port', 0);
            $fromAddress = trim((string) config('mail.from.address', ''));

            return $host === '' || $port <= 0 || $fromAddress === '';
        }

        return false;
    }
}

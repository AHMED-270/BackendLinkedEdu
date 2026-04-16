<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

        $normalizedEmail = mb_strtolower(trim((string) $request->input('email')));
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->orderByDesc('id')
            ->first();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun compte associe a cette adresse e-mail.',
            ], 404);
        }

        $temporaryPassword = $this->generateTemporaryPassword();
        $oldPassword = (string) $user->password;
        $oldRememberToken = $user->remember_token;

        $user->password = Hash::make($temporaryPassword);
        $user->remember_token = Str::random(60);
        $user->save();

        try {
            $displayName = trim((string) ($user->prenom ?? '') . ' ' . (string) ($user->nom ?? ''));
            if ($displayName === '') {
                $displayName = trim((string) ($user->name ?? 'Utilisateur'));
            }

            $loginBase = trim((string) config('app.frontend_url', ''));
            if ($loginBase === '') {
                $loginBase = trim((string) config('app.url', 'http://localhost:5173'));
            }

            if ($loginBase === '') {
                $loginBase = 'http://localhost:5173';
            }

            $loginUrl = rtrim($loginBase, '/') . '/login';

            $html = $this->buildTemporaryPasswordEmailHtml($displayName, (string) $user->email, $temporaryPassword, $loginUrl);
            $text = "Bonjour {$displayName},\n\n"
                . "Votre mot de passe a ete reinitialise.\n"
                . "Email: {$user->email}\n"
                . "Nouveau mot de passe: {$temporaryPassword}\n"
                . "Connexion: {$loginUrl}\n\n"
                . "Veuillez changer ce mot de passe apres connexion.";

            $sent = $this->sendEmailWithFallback((string) $user->email, 'Nouveau mot de passe - LinkEdu', $html, $text);

            if ($sent) {
                return response()->json([
                    'status' => 'ok',
                    'message' => 'Votre nouveau mot de passe a ete envoye a votre adresse e-mail.',
                ]);
            }

            return response()->json([
                'status' => 'ok',
                'message' => 'Service e-mail indisponible pour le moment. Nouveau mot de passe temporaire: ' . $temporaryPassword,
            ]);
        } catch (\Throwable $exception) {
            $user->password = $oldPassword;
            $user->remember_token = $oldRememberToken;
            $user->save();

            \Log::error('Password reset email delivery failed', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Service e-mail temporairement indisponible. Reessayez plus tard.',
            ], 503);
        }
    }

    private function sendEmailWithFallback(string $to, string $subject, string $htmlBody, string $textBody): bool
    {
        try {
            Mail::send([], [], function ($message) use ($to, $subject, $htmlBody) {
                $message->to($to)
                    ->subject($subject)
                    ->from(config('mail.from.address'), config('mail.from.name'));

                $message->html($htmlBody);
            });

            return true;
        } catch (\Throwable $smtpException) {
            \Log::warning('Primary mail transport failed for password reset', [
                'to' => $to,
                'error' => $smtpException->getMessage(),
            ]);
        }

        $apiKey = trim((string) config('services.resend.key', ''));
        $from = trim((string) (env('RESEND_FROM') ?: config('mail.from.address', '')));

        if ($apiKey === '' || $from === '') {
            return false;
        }

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->post('https://api.resend.com/emails', [
                    'from' => $from,
                    'to' => [$to],
                    'subject' => $subject,
                    'html' => $htmlBody,
                    'text' => $textBody,
                ]);

            return $response->successful();
        } catch (\Throwable $resendException) {
            \Log::warning('Resend fallback failed for password reset', [
                'to' => $to,
                'error' => $resendException->getMessage(),
            ]);

            return false;
        }
    }

    private function generateTemporaryPassword(int $length = 12): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $max = strlen($alphabet) - 1;
        $result = '';

        for ($i = 0; $i < $length; $i++) {
            $result .= $alphabet[random_int(0, $max)];
        }

        return $result;
    }

    private function buildTemporaryPasswordEmailHtml(string $displayName, string $email, string $temporaryPassword, string $loginUrl): string
    {
        $safeName = e($displayName);
        $safeEmail = e($email);
        $safePassword = e($temporaryPassword);
        $safeLoginUrl = e($loginUrl);

        return "
<div style=\"margin:0;padding:24px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;\">
    <div style=\"max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden;\">
        <div style=\"background:#0f172a;color:#ffffff;padding:18px 24px;\">
            <h1 style=\"margin:0;font-size:20px;line-height:1.3;\">Reinitialisation du mot de passe</h1>
        </div>

        <div style=\"padding:22px 24px;\">
            <p style=\"margin:0 0 14px 0;font-size:14px;\">Bonjour {$safeName},</p>
            <p style=\"margin:0 0 16px 0;font-size:14px;line-height:1.6;\">
                Votre mot de passe a ete reinitialise. Utilisez les informations ci-dessous pour vous connecter.
            </p>

            <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">
                <tr>
                    <td style=\"padding:10px;border:1px solid #dbe3ef;background:#f8fafc;font-weight:700;width:34%;\">Email</td>
                    <td style=\"padding:10px;border:1px solid #dbe3ef;\">{$safeEmail}</td>
                </tr>
                <tr>
                    <td style=\"padding:10px;border:1px solid #dbe3ef;background:#f8fafc;font-weight:700;\">Nouveau mot de passe</td>
                    <td style=\"padding:10px;border:1px solid #dbe3ef;font-family:Consolas,Monaco,monospace;font-size:15px;\">{$safePassword}</td>
                </tr>
            </table>

            <p style=\"margin:18px 0 0 0;font-size:14px;\">
                Lien de connexion: <a href=\"{$safeLoginUrl}\" style=\"color:#0b63f6;text-decoration:none;\">{$safeLoginUrl}</a>
            </p>
        </div>
    </div>
</div>";
    }
}

<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->bootstrapSqliteDatabase();

        // Compatibility fix for older MySQL/MariaDB index length limits.
        Schema::defaultStringLength(191);

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = trim((string) config('app.frontend_url', ''));
            $origin = request()?->headers->get('origin');

            if (is_string($origin) && filter_var($origin, FILTER_VALIDATE_URL)) {
                $frontendUrl = $origin;
            }

            if ($frontendUrl === '' || !filter_var($frontendUrl, FILTER_VALIDATE_URL)) {
                $frontendUrl = 'http://localhost:5173';
            }

            $frontendUrl = rtrim($frontendUrl, '/');
            $email = urlencode((string) $notifiable->getEmailForPasswordReset());
            return "{$frontendUrl}/password-reset/{$token}?email={$email}";
        });
    }

    private function bootstrapSqliteDatabase(): void
    {
        if ((string) config('database.default') !== 'sqlite') {
            return;
        }

        $database = (string) config('database.connections.sqlite.database');
        if ($database === '' || $database === ':memory:') {
            return;
        }

        if (! $this->isAbsolutePath($database)) {
            $database = base_path($database);
        }

        $directory = dirname($database);
        if (! is_dir($directory)) {
            @mkdir($directory, 0775, true);
        }

        if (! file_exists($database)) {
            @touch($database);
        }

        if (! filter_var(env('AUTO_BOOTSTRAP_DB', true), FILTER_VALIDATE_BOOL)) {
            return;
        }

        try {
            $hasUsers = Schema::hasTable('users');
            $hasTokens = Schema::hasTable('personal_access_tokens');

            if (! $hasUsers || ! $hasTokens) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $exception) {
            Log::warning('SQLite bootstrap failed', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    private function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, DIRECTORY_SEPARATOR)
            || (bool) preg_match('/^[A-Za-z]:[\\\\\/]/', $path);
    }
}

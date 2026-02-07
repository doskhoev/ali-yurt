import { sendLoginCode, verifyLoginCode } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const sentParam = resolvedSearchParams?.sent;
  const sent = Array.isArray(sentParam) ? sentParam[0] : sentParam;
  const emailParam = resolvedSearchParams?.email;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;
  const errorParam = resolvedSearchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const showOtpForm =
    !!email && (sent === "1" || error === "invalid_code" || error === "verify_failed");

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Вход</h1>

      {sent === "1" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              Мы отправили код на вашу почту. Введите его ниже.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              {error === "invalid_code" && "Код должен состоять из 8 цифр."}
              {error === "send_failed" && "Не удалось отправить код. Попробуйте позже."}
              {error === "rate_limit" && "Слишком много попыток. Попробуйте чуть позже."}
              {error === "verify_failed" && "Неверный код. Попробуйте еще раз."}
              {error === "missing_email" && "Введите email для отправки кода."}
            </p>
          </CardContent>
        </Card>
      )}

      <form action={sendLoginCode} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            defaultValue={email ?? ""}
          />
        </div>

        <SubmitButton>Отправить код</SubmitButton>
      </form>

      {showOtpForm && (
        <form action={verifyLoginCode} className="space-y-3">
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <Label htmlFor="token">Код из письма</Label>
            <InputOTP
              id="token"
              name="token"
              maxLength={8}
              inputMode="numeric"
              pattern="^[0-9]+$"
              autoComplete="one-time-code"
              required
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <SubmitButton>Войти</SubmitButton>
        </form>
      )}
    </main>
  );
}



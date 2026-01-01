import { signInWithOtp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchParams = Record<string, string | string[] | undefined>;

export default function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const checkParam = searchParams?.check;
  const check = Array.isArray(checkParam) ? checkParam[0] : checkParam;

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Вход</h1>

      {check === "1" && (
        <p className="rounded-md border p-3 text-sm">
          Проверь почту — мы отправили ссылку для входа.
        </p>
      )}

      <form action={signInWithOtp} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <Button type="submit">Отправить ссылку</Button>
      </form>
    </main>
  );
}



import { signInWithOtp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const checkParam = resolvedSearchParams?.check;
  const check = Array.isArray(checkParam) ? checkParam[0] : checkParam;

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Вход</h1>

      {check === "1" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              Проверьте почту на этом устройстве и перейдите по ссылке для входа.
            </p>
          </CardContent>
        </Card>
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



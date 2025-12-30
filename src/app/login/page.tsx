import { signInWithOtp } from "./actions";

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
        <label className="block space-y-1">
          <span className="text-sm">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Отправить ссылку
        </button>
      </form>
    </main>
  );
}



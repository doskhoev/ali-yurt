import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

type FeedbackRow = {
  id: string;
  user_id: string;
  subject: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
};

function formatDateTimeRu(iso: string) {
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

function getStatusBadge(status: FeedbackRow["status"]) {
  const variants: Record<FeedbackRow["status"], { label: string; className: string }> = {
    new: {
      label: "Новое",
      className: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    },
    in_progress: {
      label: "В работе",
      className: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
    },
    resolved: {
      label: "Решено",
      className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
    closed: {
      label: "Закрыто",
      className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
    },
  };

  const variant = variants[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variant.className}`}>
      {variant.label}
    </span>
  );
}

export default async function AdminFeedbackPage() {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const { data: rows, error } = await supabase
    .from("feedback_messages")
    .select("id, user_id, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const items = ((rows ?? []) as Omit<FeedbackRow, "profiles">[]).filter(Boolean);

  // Получаем username для всех пользователей
  const userIds = Array.from(new Set(items.map((item) => item.user_id)));
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds)
    : { data: [] as { id: string; username: string | null }[] };

  const usernameById = new Map<string, string | null>();
  (profiles ?? []).forEach((p) => {
    usernameById.set(p.id, p.username);
  });

  // Объединяем данные
  const itemsWithProfiles: FeedbackRow[] = items.map((item) => ({
    ...item,
    profiles: {
      username: usernameById.get(item.user_id) || null,
    },
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Админка · Обратная связь</h1>
        <p className="text-sm text-muted-foreground">
          Сообщения от пользователей.
        </p>
        {error && (
          <p className="text-sm text-red-600">Ошибка: {error.message}</p>
        )}
      </header>

      {itemsWithProfiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет сообщений.</p>
      ) : (
        <ul className="space-y-3">
          {itemsWithProfiles.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border p-4 hover:bg-muted/50 transition-colors"
            >
              <Link href={`/admin/feedback/${item.id}`} className="block">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{item.subject}</div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      от {item.profiles?.username || "Неизвестный пользователь"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTimeRu(item.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


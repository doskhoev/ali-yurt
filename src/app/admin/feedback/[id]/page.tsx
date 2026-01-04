import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/auth/admin";
import { updateFeedbackStatus, deleteFeedback } from "../actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

type FeedbackRow = {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: "new" | "in_progress" | "resolved" | "closed";
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    profiles: {
        username: string | null;
        email: string | null;
    } | null;
};

function formatDateTimeRu(iso: string) {
    const dt = new Date(iso);
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(dt);
}

export default async function AdminFeedbackDetailPage({
    params,
    searchParams,
}: {
    params: { id: string } | Promise<{ id: string }>;
    searchParams?: SearchParams;
}) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const supabase = await createSupabaseServerClient();
    const isAdmin = await getIsAdmin();

    if (!isAdmin) {
        redirect("/");
    }

    const { data: item, error } = await supabase
        .from("feedback_messages")
        .select("id, user_id, subject, message, status, admin_notes, created_at, updated_at")
        .eq("id", id)
        .single();

    if (error || !item) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Сообщение не найдено или произошла ошибка: {error?.message || "Неизвестная ошибка"}
                    </AlertDescription>
                </Alert>
            </main>
        );
    }

    // Получаем username пользователя
    const { data: profile } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("id", item.user_id)
        .maybeSingle();

    const feedback: FeedbackRow = {
        ...item,
        profiles: {
            username: profile?.username || null,
            email: profile?.email || null,
        },
    };

    const resolvedSearchParams = await Promise.resolve(searchParams || {});
    const errorParam = resolvedSearchParams.error;
    const successParam = resolvedSearchParams.success;
    const searchError = Array.isArray(errorParam) ? errorParam[0] : errorParam;
    const success = Array.isArray(successParam) ? successParam[0] : successParam;

    return (
        <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">Сообщение обратной связи</h1>
                <p className="text-sm text-muted-foreground">
                    ID: <span className="font-mono">{feedback.id}</span>
                </p>
            </header>

            {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        Изменения сохранены.
                    </AlertDescription>
                </Alert>
            )}

            {searchError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {decodeURIComponent(searchError)}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <section className="rounded-xl border p-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">От пользователя</Label>
                        <div className="text-base">
                            {`${feedback.profiles?.username || "Неизвестный пользователь"} (${feedback.profiles?.email})`}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Тема</Label>
                        <div className="text-base font-medium">{feedback.subject}</div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Сообщение</Label>
                        <div className="text-base whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                            {feedback.message}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Создано</Label>
                            <div>{formatDateTimeRu(feedback.created_at)}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Обновлено</Label>
                            <div>{formatDateTimeRu(feedback.updated_at)}</div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Управление</h2>

                    <form action={updateFeedbackStatus.bind(null, feedback.id)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Статус</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={feedback.status}
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="new">Новое</option>
                                <option value="in_progress">В работе</option>
                                <option value="resolved">Решено</option>
                                <option value="closed">Закрыто</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin_notes">Заметки админа</Label>
                            <Textarea
                                id="admin_notes"
                                name="admin_notes"
                                rows={4}
                                defaultValue={feedback.admin_notes || ""}
                                placeholder="Внутренние заметки (не видны пользователю)…"
                            />
                        </div>

                        <SubmitButton>Сохранить изменения</SubmitButton>
                    </form>

                    <form action={deleteFeedback.bind(null, feedback.id)} id={`delete-feedback-${feedback.id}`} className="mt-4">
                    </form>
                    <div className="flex justify-end">
                        <DeleteButton
                            formId={`delete-feedback-${feedback.id}`}
                            description="Сообщение будет удалено безвозвратно."
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}


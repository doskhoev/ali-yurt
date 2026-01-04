import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { submitFeedback } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function FeedbackPage({
    searchParams,
}: {
    searchParams?: SearchParams;
}) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        redirect("/login");
    }

    const resolvedSearchParams = await Promise.resolve(searchParams || {});
    const errorParam = resolvedSearchParams.error;
    const successParam = resolvedSearchParams.success;
    const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
    const success = Array.isArray(successParam) ? successParam[0] : successParam;

    let errorMessage = "";
    if (error === "empty_fields") {
        errorMessage = "Пожалуйста, заполните все обязательные поля.";
    } else if (error === "subject_too_long") {
        errorMessage = "Тема сообщения слишком длинная (максимум 200 символов).";
    } else if (error === "message_too_long") {
        errorMessage = "Сообщение слишком длинное (максимум 5000 символов).";
    } else if (error) {
        errorMessage = decodeURIComponent(error);
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">Обратная связь</h1>
                <p className="text-sm text-muted-foreground">
                    Предложите новость, сообщите о проблеме в селе или задайте вопрос.
                </p>
            </header>

            {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20 flex items-center gap-3 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0 [&>svg+div]:translate-y-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <AlertDescription className="text-green-800 dark:text-green-200 flex items-center">
                        Сообщение успешно отправлено! Мы рассмотрим его в ближайшее время.
                    </AlertDescription>
                </Alert>
            )}

            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <form action={submitFeedback} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">
                        Тема <span className="text-red-600">*</span>
                    </Label>
                    <Input
                        id="subject"
                        name="subject"
                        required
                        maxLength={200}
                        placeholder="Например: Предложение новости или Сообщение о проблеме"
                    />
                    <p className="text-xs text-muted-foreground">
                        Максимум 200 символов
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">
                        Сообщение <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                        id="message"
                        name="message"
                        required
                        rows={8}
                        maxLength={5000}
                        placeholder="Опишите подробно ваше предложение, проблему или вопрос…"
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Максимум 5000 символов
                    </p>
                </div>

                <SubmitButton>Отправить</SubmitButton>
            </form>
        </main>
    );
}


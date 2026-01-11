import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "О селе | Али-Юрт",
    description: "Информация о селе Али-Юрт",
};

export default async function AboutPage() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">О селе</h1>
            </header>

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                    Село расположено юго-восточнее города Назрань и южнее города Магас. Благодаря своему географическому положению, Али-Юрт обладает уникальным микроклиматом.
                </p>
                <p>
                    В селе функционируют школы, амбулатория, дом культуры и несколько мечетей. Это динамично развивающийся населенный пункт, сохраняющий при этом свой традиционный уклад.
                </p>
            </div>

            {user && (
                <div className="mt-8 pt-6 border-t">
                    <h2 className="text-lg font-semibold mb-2">Обратная связь</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Предложите новость, сообщите о проблеме в селе или задайте вопрос.
                    </p>
                    <Link
                        href="/feedback"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                        Написать сообщение
                    </Link>
                </div>
            )}
        </main>
    );
}


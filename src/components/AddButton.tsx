"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

type AddButtonProps = {
  href: string;
  children: React.ReactNode;
};

export function AddButton({ href, children }: AddButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} asChild={false}>
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Загрузка...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}


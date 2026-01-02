"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

type ViewOnSiteButtonProps = {
  href: string;
};

export function ViewOnSiteButton({ href }: ViewOnSiteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Загрузка...
        </>
      ) : (
        <>
          Открыть на сайте
          <ExternalLink className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  );
}


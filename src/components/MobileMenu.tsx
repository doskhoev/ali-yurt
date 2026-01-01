"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutButton } from "@/components/LogoutButton";
import { Settings } from "lucide-react";

type MobileMenuProps = {
  isAdmin: boolean;
  user: { email?: string | null } | null | undefined;
};

export function MobileMenu({ isAdmin, user }: MobileMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-base font-semibold hover:text-foreground"
          >
            Али-Юрт
          </Link>
          <Link
            href="/news"
            onClick={() => setOpen(false)}
            className="text-base text-muted-foreground hover:text-foreground"
          >
            Новости
          </Link>
          <Link
            href="/places"
            onClick={() => setOpen(false)}
            className="text-base text-muted-foreground hover:text-foreground"
          >
            Места
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="text-base text-muted-foreground hover:text-foreground"
          >
            О селе
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="text-base text-muted-foreground hover:text-foreground"
            >
              Админка
            </Link>
          )}
          <div className="pt-4 border-t">
            {!user ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground"
              >
                Вход
              </Link>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  <span>Настройки</span>
                </Link>
                <div className="w-full" onClick={() => setOpen(false)}>
                  <LogoutButton variant="mobile" />
                </div>
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}


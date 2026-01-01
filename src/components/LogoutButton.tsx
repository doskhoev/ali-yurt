"use client";

import { signOut } from "@/app/login/actions";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type LogoutButtonProps = {
  variant?: "dropdown" | "mobile";
};

export function LogoutButton({ variant = "dropdown" }: LogoutButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 text-base text-muted-foreground hover:text-foreground text-left"
      >
        <LogOut className="h-4 w-4" />
        <span>Выйти</span>
      </button>
    );
  }

  return (
    <DropdownMenuItem onClick={handleClick}>
      <LogOut className="h-4 w-4" />
      <span>Выйти</span>
    </DropdownMenuItem>
  );
}


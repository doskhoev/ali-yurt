"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function HeaderHider() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      if (pathname === "/setup-username") {
        header.style.display = "none";
      } else {
        header.style.display = "";
      }
    }
  }, [pathname]);

  return null;
}


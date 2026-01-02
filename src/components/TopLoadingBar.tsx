"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoadingBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathRef = useRef(pathname);

  // Отслеживаем клики по ссылкам для немедленного показа прогресса
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      // Проверяем, что это внутренняя ссылка Next.js
      if (link && link.href && !link.target && !link.hasAttribute("download")) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);
          
          // Если это другой путь на том же домене, показываем прогресс сразу
          if (url.origin === currentUrl.origin && url.pathname !== currentPathRef.current) {
            setLoading(true);
          }
        } catch {
          // Игнорируем ошибки парсинга URL
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Скрываем прогресс после завершения навигации
  useEffect(() => {
    // Обновляем текущий путь
    if (currentPathRef.current !== pathname) {
      currentPathRef.current = pathname;
      
      // Если был показ прогресса, скрываем его через небольшую задержку
      if (loading) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    }
  }, [pathname, searchParams, loading]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.25 bg-primary/20">
      <div 
        className="h-full bg-primary"
        style={{
          animation: "loading 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}


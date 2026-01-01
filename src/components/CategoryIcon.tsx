"use client";

import * as React from "react";

type CategoryIconProps = {
  svgCode: string | null;
  className?: string;
};

export function CategoryIcon({ svgCode, className = "w-16 h-16 text-primary" }: CategoryIconProps) {
  if (!svgCode || !svgCode.trim()) {
    return null;
  }

  // Обрабатываем SVG: только устанавливаем размеры 64x64
  const processedSvg = React.useMemo(() => {
    let processed = svgCode.trim();
    
    // Устанавливаем размеры SVG на 64x64
    // Удаляем существующие width и height
    processed = processed.replace(/\s+(width|height)="[^"]*"/gi, '');
    // Добавляем width="64" height="64" к корневому элементу
    processed = processed.replace(/<svg([^>]*)>/, '<svg$1 width="64" height="64">');
    
    return processed;
  }, [svgCode]);

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: processedSvg.replace(/<svg/, '<svg style="width: 100%; height: 100%;"') }}
    />
  );
}


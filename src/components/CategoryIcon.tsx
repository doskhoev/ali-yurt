"use client";

import * as React from "react";

type CategoryIconProps = {
  svgCode: string | null;
  className?: string;
};

export function CategoryIcon({ svgCode, className = "w-16 h-16 text-primary" }: CategoryIconProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || !svgCode || !svgCode.trim()) {
      return;
    }

    // Очищаем контейнер
    containerRef.current.innerHTML = '';

    // Используем DOMParser для корректного парсинга SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode.trim(), 'image/svg+xml');
    
    // Проверяем на ошибки парсинга
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('SVG parsing error:', parserError.textContent);
      return;
    }

    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      return;
    }

    // Извлекаем или устанавливаем viewBox
    let viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
      viewBox = '0 0 64 64';
    }

    // Устанавливаем атрибуты SVG
    // Не устанавливаем width и height в атрибутах, чтобы SVG масштабировался через CSS
    svgElement.setAttribute('viewBox', viewBox);
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgElement.setAttribute('style', 'width: 100%; height: 100%; display: block;');
    
    // Убеждаемся, что xmlns присутствует
    if (!svgElement.getAttribute('xmlns')) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Клонируем и вставляем SVG в контейнер
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    containerRef.current.appendChild(clonedSvg);
  }, [svgCode]);

  if (!svgCode || !svgCode.trim()) {
    return null;
  }

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ 
        display: 'inline-block',
        lineHeight: 0,
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    />
  );
}


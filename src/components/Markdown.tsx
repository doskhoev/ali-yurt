"use client";

import * as React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const components: Components = {
  code({ node, className, children, ...props }) {
    // Проверяем, является ли это inline кодом
    // В react-markdown inline код не имеет className с "language-"
    const isInline = !className || !className.startsWith("language-");
    
    if (isInline) {
      // Получаем текст из children
      let codeText = "";
      
      if (typeof children === "string") {
        codeText = children;
      } else if (Array.isArray(children)) {
        codeText = children
          .map((child) => {
            if (typeof child === "string") {
              return child;
            }
            // Для React элементов пытаемся извлечь текст
            if (child && typeof child === "object") {
              if ("props" in child && child.props && "children" in child.props) {
                return String(child.props.children);
              }
            }
            return String(child);
          })
          .join("");
      } else {
        codeText = String(children ?? "");
      }
      
      // Убираем обратные кавычки в начале и конце строки
      // Также убираем экранированные обратные кавычки (``)
      let cleanedCode = codeText.trim();
      
      // Убираем обратные кавычки в начале
      while (cleanedCode.startsWith("`")) {
        cleanedCode = cleanedCode.slice(1);
      }
      
      // Убираем обратные кавычки в конце
      while (cleanedCode.endsWith("`")) {
        cleanedCode = cleanedCode.slice(0, -1);
      }
      
      return (
        <code className="inline-code" {...props}>
          {cleanedCode}
        </code>
      );
    }
    
    // Блок кода с подсветкой синтаксиса
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    
    // Получаем текст кода
    const codeString = Array.isArray(children)
      ? children.join("")
      : String(children);
    
    return (
      <div className="code-block-wrapper">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          PreTag="div"
          className="code-block"
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  },
  pre({ node, children, ...props }) {
    // Если внутри pre есть code с language-, SyntaxHighlighter уже обработал его
    // Просто возвращаем children как есть
    return <>{children}</>;
  },
};

type MarkdownProps = {
  value: string;
  imageUrls?: string[];
  imageAlt?: string;
};

export function Markdown({ value, imageUrls = [], imageAlt = "Изображение" }: MarkdownProps) {
  // Разбиваем контент на части: текст и изображения
  const contentParts = React.useMemo(() => {
    if (imageUrls.length === 0) {
      return [{ type: "text" as const, content: value }];
    }

    const parts: Array<{ type: "text" | "image"; content?: string; imageIndex?: number }> = [];
    const placeholderRegex = /\{\{image:(\d+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderRegex.exec(value)) !== null) {
      const imageIndex = parseInt(match[1], 10);
      
      // Добавляем текст до плейсхолдера
      if (match.index > lastIndex) {
        const textBefore = value.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: "text", content: textBefore });
        }
      }

      // Проверяем, существует ли изображение с таким индексом
      if (imageIndex >= 0 && imageIndex < imageUrls.length && imageUrls[imageIndex]) {
        parts.push({ type: "image", imageIndex });
      }

      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
    if (lastIndex < value.length) {
      const textAfter = value.substring(lastIndex);
      if (textAfter.trim()) {
        parts.push({ type: "text", content: textAfter });
      }
    }

    // Если не было плейсхолдеров, возвращаем весь текст
    if (parts.length === 0) {
      return [{ type: "text" as const, content: value }];
    }

    return parts;
  }, [value, imageUrls]);

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {contentParts.map((part, index) => {
        if (part.type === "image" && part.imageIndex !== undefined) {
          return (
            <div key={`image-${index}`} className="flex justify-center my-6">
              <Image
                src={imageUrls[part.imageIndex]}
                alt={`${imageAlt} ${part.imageIndex + 1}`}
                width={800}
                height={400}
                className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded-xl border"
                style={{ height: "auto" }}
              />
            </div>
          );
        }
        
        return (
          <ReactMarkdown key={`text-${index}`} remarkPlugins={[remarkGfm]} components={components}>
            {part.content || ""}
          </ReactMarkdown>
        );
      })}
    </article>
  );
}



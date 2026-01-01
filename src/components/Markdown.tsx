"use client";

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
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        className="code-block"
        customStyle={{
          margin: "1rem 0",
          borderRadius: "0.5rem",
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    );
  },
  pre({ node, children, ...props }) {
    // Если внутри pre есть code с language-, SyntaxHighlighter уже обработал его
    // Просто возвращаем children как есть
    return <>{children}</>;
  },
};

export function Markdown({ value }: { value: string }) {
  return (
    <article className="prose prose-neutral max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {value}
      </ReactMarkdown>
    </article>
  );
}



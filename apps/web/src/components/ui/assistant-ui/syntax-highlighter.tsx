import React from "react";

export const SyntaxHighlighter = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLPreElement>) => {
  return (
    <pre className={className} {...props}>
      <code>{children}</code>
    </pre>
  );
};

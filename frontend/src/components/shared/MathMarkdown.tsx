import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export default function MathMarkdown(props: Readonly<{children: string}>): JSX.Element {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {props.children}
    </ReactMarkdown>
  );
}

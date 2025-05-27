// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

/**
 * Renders the given content in a Markdown environment that supports mathematical equations.
 */
export default function MathMarkdown(props: Readonly<{children: string}>): JSX.Element {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {props.children}
    </ReactMarkdown>
  );
}

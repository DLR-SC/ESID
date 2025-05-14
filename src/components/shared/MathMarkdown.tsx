// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

/**
 * Renders the given content in a markdown environment that supports mathematical equations.
 */
export default function MathMarkdown(props: Readonly<{children: string}>): JSX.Element {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {props.children}
    </ReactMarkdown>
  );
}

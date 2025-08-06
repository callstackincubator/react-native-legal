import type { ComponentProps } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ExternalLink from './ExternalLink';

export type MarkdownBlockProps = ComponentProps<typeof Markdown>;

export default function MarkdownBlock({ children, ...props }: MarkdownBlockProps) {
  return (
    <Markdown
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
      components={{
        ...(props.components ?? {}),
        a: ({ children, href }) => (
          <ExternalLink href={href as string} inline>
            {children}
          </ExternalLink>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}

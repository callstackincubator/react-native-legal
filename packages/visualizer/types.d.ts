declare module 'katex/dist/contrib/auto-render' {
  export default function renderMathInElement(element: HTMLElement, options: object): void;
}

declare module '*.md' {
  const contents: string;
  export default contents;
}

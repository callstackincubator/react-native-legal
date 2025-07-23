import { Stack } from '@mui/material';

import MarkdownBlock from '@/components/MarkdownBlock';

import licenses from './licenses.md';

export default function Licenses() {
  return (
    <Stack direction="column" padding={4}>
      <MarkdownBlock>{`# OSS Licenses\n\n${licenses}`}</MarkdownBlock>
    </Stack>
  );
}

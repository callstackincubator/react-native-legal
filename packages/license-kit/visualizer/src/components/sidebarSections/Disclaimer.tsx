import { Stack, Typography } from '@mui/material';

import ExternalLink from '../ExternalLink';

export default function Disclaimer() {
  return (
    <Stack>
      <Typography variant="h6">Disclaimer</Typography>

      <Typography>
        This tool does not serve as any sort of legal advice. Your use of this tool is at your own risk, remember to
        always verify results manually & consult with a legal professional before making any decisions.
      </Typography>

      <Typography>
        This tool is not affiliated with any of the companies or organizations that are listed in the report.
      </Typography>

      <Typography>This tool is not responsible for any errors or omissions in the report.</Typography>

      <Typography>
        As to the mechanics of the way this tool operates, please see the limitations and design assumptions{' '}
        <ExternalLink href="https://callstackincubator.github.io/react-native-legal/docs/programmatic-usage.html#additional-details">
          in the documentation
        </ExternalLink>
        .
      </Typography>
    </Stack>
  );
}

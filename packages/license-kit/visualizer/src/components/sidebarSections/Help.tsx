import { Stack, Typography } from '@mui/material';

import ExternalLink from '../ExternalLink';

export default function Help() {
  return (
    <Stack>
      <Typography variant="h6">Help</Typography>

      <Typography>This tool visualizes the license dependencies of your project.</Typography>

      <Typography>
        The first accordion section above present you: the 'permissiveness score' of your project, which is a weighted
        average of the counts of respective license categories (strong-copyleft, weak-copyleft, permissive, unknown)
        that should help you have a general overview of the balance between permissive & other categories of
        dependencies in your project. The weights have been arbitrarily set to custom values. You can preview what's
        happening under the hood by clicking the "How was the above calculated?" button.
      </Typography>

      <Typography>
        The second accordion section above presents you with a breakdown of the license categories, and the count of
        packages in each of them. Respective charts show you the share of specific license types within each of the
        categories, the share of license types in the project, and the share of license categories in the project.
      </Typography>

      <Typography>
        The third accordion section above presents you (
        <ExternalLink href="https://caniuse.com/mdn-api_summarizer">if available in your browser</ExternalLink>) with an
        AI-generated summary of the state of the hovered package.
      </Typography>
    </Stack>
  );
}

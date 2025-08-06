import { Stack, Typography } from '@mui/material';

import ExternalLink from '../ExternalLink';

export default function Help() {
  return (
    <Stack gap={2}>
      <Typography variant="h6">Help</Typography>

      <Typography>This tool visualizes the license dependencies of your project.</Typography>

      <Typography>
        The first accordion section above presents you the breakdown of license types into categories and the share of
        specific license types in your project, which gives a quick overview of what was scanned.
      </Typography>

      <Typography>
        The second accordion section above presents you with a breakdown of the license categories, and the count of
        packages in each of them. Respective charts show you the share of specific license types within each of the
        categories, the share of license types in the project, and the share of license categories in the project.
      </Typography>

      <Typography>
        The third accordion section above presents you (
        <ExternalLink href="https://caniuse.com/mdn-api_summarizer" inline>
          if available in your browser
        </ExternalLink>
        ) an AI-generated summary of the graph, which may help you get some insights before the first manual look at the
        graph.
      </Typography>

      <Typography>
        The GUI allows you to browse the graph, view information about the most-recently-hovered node on top of this
        sidebar. Clicking on a node changes the view to browse the subgraph rooted at this node, with the trace of nodes
        between the root project and the selected node, allowing you to see the causal hierarchy of packages. To cancel
        the filtered mode, click the selected root node again, or click the yellow text button on top of the graph pane,
        which will reset the view to be rooted at the root project node (i.e., show all nodes).
      </Typography>

      <Typography>
        Remember that all data presented by the tool require manual verification. The presented information may be
        inaccurate or incomplete. Moreover, for packages classified as with &apos;unknown&apos; license, manual
        inspection is required to check the conditions of the actual license.
      </Typography>

      <Typography>
        OSS license attributions for this project can be found{' '}
        <ExternalLink href="/licenses" inline>
          here
        </ExternalLink>
        .
      </Typography>
    </Stack>
  );
}

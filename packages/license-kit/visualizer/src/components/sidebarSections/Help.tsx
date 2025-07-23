import { Stack, Typography } from '@mui/material';

import ExternalLink from '../ExternalLink';

export default function Help() {
  return (
    <Stack gap={2}>
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
        Remember that all data presented here require manual verification. Moreover, for packages classified as with
        'unknown' license, manual inspection is required to check the conditions of the actual license.
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

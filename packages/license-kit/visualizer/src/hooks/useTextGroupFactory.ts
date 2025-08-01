import type { TreeNode } from '@/types/TreeNode';
import { type Types } from '@callstack/licenses';
import type { graphlib } from '@dagrejs/dagre';
import { useTheme } from '@mui/material';
import * as d3 from 'd3';
import { useCallback } from 'react';

/**
 * Constructs an SVG group containing a text element
 * provided by the `textFactory` on top of a rect with theme's default background.
 * @param graph The dagrejs graph instance.
 * @returns A function that creates an SVG group containing a text element provided by the `textFactory` on top of a rect with theme's default background.
 */
export function useTextGroupFactory(graph: graphlib.Graph<TreeNode>) {
  const theme = useTheme();

  const textGroupFactory = useCallback(
    /**
     * A function that creates an SVG group containing a text element provided by the `textFactory` on top of a rect with theme's default background.
     * @param textGroups Text groups selection.
     * @param textFactory Provides the SVG text element for the given group and meta.
     * @param options Options for the text group factory.
     * @param options.rectFillFactory A function that provides the fill color for the rect.
     * @param options.backgroundRectAlpha The opacity of the rect.
     */
    (
      textGroups: d3.Selection<SVGGElement, string, d3.BaseType, unknown>,
      textFactory: (
        group: d3.Selection<SVGGElement, unknown, null, undefined>,
        meta: Types.License,
      ) => d3.Selection<SVGTextElement, unknown, null, undefined>,
      {
        rectFillFactory,
        backgroundRectAlpha = 0.65,
      }: {
        rectFillFactory?: (meta: Types.License) => string | null | undefined;
        backgroundRectAlpha?: number;
      } = {},
    ) => {
      textGroups.each(function (d) {
        const group = d3.select(this);
        const meta = graph.node(d)?.meta;

        // text first
        const text = textFactory(group, meta);

        // measure text bounding box
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const bbox = text.node()!.getBBox();

        // rect before text
        group
          .insert('rect', 'text')
          .attr('x', bbox.x - 4)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 4)
          .attr('fill', rectFillFactory?.(meta) ?? theme.palette.background.paper)
          .attr('fill-opacity', backgroundRectAlpha)
          .attr('rx', 10)
          .style('pointer-events', 'none');
      });
    },
    [graph, theme.palette.background.paper],
  );

  return textGroupFactory;
}

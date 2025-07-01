'use client';

import type { Types } from '@callstack/licenses';
import { layout as dagreLayout } from '@dagrejs/dagre';
import { useTheme } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import * as d3 from 'd3';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef } from 'react';
import { tss } from 'tss-react/mui';

import type { TextCoordFactory } from '@/types/TextCoordFactory';
import {
  licenseLabelYCoordFactory,
  nameLabelYCoordFactory,
  versionLabelYCoordFactory,
} from '@/utils/textCoordFactories';
import { DEFAULT_RADIUS, HOVER_RADIUS, INACTIVE_HOVER_MODE_OPACITY } from '@/constants';
import { useTextGroupFactory } from '@/hooks/useTextGroupFactory';
import { buildHierarchy } from '@/utils/buildHierarchy';

export type Props = {
  data: Types.AggregatedLicensesObj;
};

export default function Tree({ data }: Props) {
  const { width, height } = useWindowSize();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { graph, incomplete: treeIncomplete } = useMemo(() => buildHierarchy(data), [data]);

  const prepareTextGroupsWithBackgrounds = useTextGroupFactory(graph);

  useEffect(() => {
    enqueueSnackbar({
      message:
        'Stopped parsing the tree early due to excessive depth. This is likely a bug. The tree may be INCOMPLETE.',
      variant: 'warning',
    });
  }, [enqueueSnackbar, treeIncomplete]);

  const { selectedNodeStrokeColor, linkColor, libNameTextColor, licenseTextColor } = useMemo(
    () =>
      theme.palette.mode === 'dark'
        ? {
            selectedNodeStrokeColor: '#fff',
            linkColor: '#999',
            libNameTextColor: '#fff',
            licenseTextColor: '#fff',
          }
        : {
            selectedNodeStrokeColor: '#000',
            linkColor: '#666',
            libNameTextColor: '#000',
            licenseTextColor: '#000',
          },
    [theme.palette.mode],
  );

  useEffect(() => {
    if (!width || !height || !svgRef.current) {
      return;
    }

    const fillColorScaleByDepth = d3.scaleOrdinal(d3.schemeCategory10);

    const nonLeaveNodes = graph.nodes().filter((d) => graph.node(d).children.length > 0);
    const totalNonLeaves = nonLeaveNodes.length;

    let i = 0;
    const borderColorScaleByParentMapping: Record<string, string> = {};

    nonLeaveNodes.forEach((d) => {
      borderColorScaleByParentMapping[graph.node(d).meta.name] = d3.interpolateRainbow(i / totalNonLeaves);
      i++;
    });

    function nodeStrokeFactory(d: Types.LicenseObj) {
      return d.parentPackageName ? borderColorScaleByParentMapping[d.parentPackageName] : selectedNodeStrokeColor;
    }

    const svg = d3.select(svgRef.current),
      inner = svg.select('g');

    // Set some general styles
    graph.nodes().forEach(function (v) {
      const node = graph.node(v);

      node.rx = node.ry = 5;
      node.width = node.height = DEFAULT_RADIUS * 2;
    });

    dagreLayout(graph);

    // apply extent to fit graph bounds
    const zoom = d3
      .zoom()
      .extent([
        [0, 0],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [graph.graph().width!, graph.graph().height!],
      ])
      .scaleExtent([0.1, 20])
      .on('zoom', function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        inner.attr('transform', d3.zoomTransform(this));
      });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    svg.call(zoom).on('wheel.zoom', (event: WheelEvent) => {
      event.preventDefault();

      const currentZoom = svg.property('__zoom').k ?? 1.0;

      if (event.ctrlKey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        zoom.scaleTo(svg, currentZoom * Math.pow(2.0, -event.deltaY / 100.0), d3.pointer(event));
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        zoom.translateBy(svg, -(event.deltaX / currentZoom), -(event.deltaY / currentZoom));
      }
    });

    if (process.env.NODE_ENV === 'development') {
      // print nodes & edges

      console.log('Nodes');
      const nodes = graph.nodes().map((v) => {
        const node = graph.node(v);

        return {
          name: node.meta.name,
          version: node.meta.version,
          depth: node.depth,
          x: node.x,
          y: node.y,
        };
      });

      console.table(nodes);

      console.log('Edges');
      const edges = graph.edges().map((e) => {
        const edge = graph.edge(e);

        return {
          v: e.v,
          w: e.w,
          label: edge.label,
        };
      });

      console.table(edges);
    }

    // Center the graph
    const initialScale = 0.75;

    svg.call(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      zoom.transform,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      d3.zoomIdentity.translate((svg.attr('width') - graph.graph().width * initialScale) / 2, 20).scale(initialScale),
    );

    // render nodes & edges
    const links = inner
      .selectAll('line')
      .data(graph.edges())
      .enter()
      .append('line')
      .attr('x1', (d) => graph.node(d.v)?.x ?? null)
      .attr('y1', (d) => graph.node(d.v)?.y ?? null)
      .attr('x2', (d) => graph.node(d.w)?.x ?? null)
      .attr('y2', (d) => graph.node(d.w)?.y ?? null)
      .attr('stroke', linkColor)
      .attr('stroke-width', 2);

    const nodes = inner
      .selectAll('circle')
      .data(graph.nodes())
      .enter()
      .append('circle')
      .attr('cx', (d) => graph.node(d)?.x ?? null)
      .attr('cy', (d) => graph.node(d)?.y ?? null)
      .attr('r', DEFAULT_RADIUS)
      .style('fill', (d) => fillColorScaleByDepth(graph.node(d)?.depth.toString() ?? '0'))
      .attr('stroke', (d) => nodeStrokeFactory(graph.node(d)?.meta ?? {}))
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const t = d3.transition().duration(200);
        const thisNode = graph.node(d);

        d3.select<SVGCircleElement, string>(event.currentTarget)
          .transition(t)
          .attr('r', HOVER_RADIUS)
          .attr('stroke-width', 3)
          .attr('stroke', selectedNodeStrokeColor)
          // below: fix for fast mouse change between nodes from different rows
          .filter((key) => key === thisNode.meta.key)
          .style('opacity', () => 1);

        links
          .transition(t)
          .style('opacity', (link) => (link.v === thisNode.meta.parentPackageKey ? 1 : INACTIVE_HOVER_MODE_OPACITY));

        for (const [texts, yCoordFactory, up] of [
          [labelGroups, nameLabelYCoordFactory, true],
          [versionLabelGroups, versionLabelYCoordFactory, true],
          [licenseLabelGroups, licenseLabelYCoordFactory, false],
        ] as [
          texts: d3.Selection<SVGGElement, string, d3.BaseType, unknown>,
          factory: TextCoordFactory,
          up: boolean,
        ][]) {
          texts.transition(t).style('opacity', (pred) => {
            const predNode = graph.node(pred as string);

            return predNode.meta.parentPackageKey === thisNode.meta.parentPackageKey ||
              predNode.meta.key === thisNode.meta.parentPackageKey
              ? 1
              : INACTIVE_HOVER_MODE_OPACITY;
          });

          texts.transition(t).attr('transform', (pred) => {
            const node = graph.node(pred);

            const x = node?.x ?? 0;
            const y =
              node.meta === thisNode.meta
                ? yCoordFactory(node) + ((up ? -1 : 1) * HOVER_RADIUS) / 2
                : yCoordFactory(node);

            return `translate(${x}, ${y})`;
          });
        }

        nodes
          .filter((pred) => pred !== d)
          .transition(t)
          .style('opacity', (pred) => {
            const predNode = graph.node(pred as string);

            return predNode.meta.parentPackageKey === thisNode.meta.parentPackageKey ||
              predNode.meta.key === thisNode.meta.parentPackageKey
              ? 1
              : INACTIVE_HOVER_MODE_OPACITY;
          });
      })
      .on('mouseout', () => {
        const t = d3.transition().duration(200);

        links.transition(t).style('opacity', 1);

        labelGroups.transition(t).style('opacity', 1);
        versionLabelGroups.transition(t).style('opacity', 1);
        licenseLabelGroups.transition(t).style('opacity', 1);

        labelGroups.transition(t).attr('transform', (pred) => {
          const node = graph.node(pred);

          return `translate(${node.x}, ${nameLabelYCoordFactory(node)})`;
        });
        versionLabelGroups.transition(t).attr('transform', (pred) => {
          const node = graph.node(pred);

          return `translate(${node.x}, ${versionLabelYCoordFactory(node)})`;
        });
        licenseLabelGroups.transition(t).attr('transform', (pred) => {
          const node = graph.node(pred);

          return `translate(${node.x}, ${licenseLabelYCoordFactory(node)})`;
        });

        nodes
          .transition(t)
          .style('opacity', 1)
          .attr('r', DEFAULT_RADIUS)
          .attr('stroke-width', 2)
          .attr('stroke', (d) => nodeStrokeFactory(graph.node(d)?.meta ?? {}));
      });

    const labelGroups = inner
      .selectAll('g.label')
      .data(graph.nodes())
      .enter()
      .append('g')
      .attr('class', 'label')
      .attr('transform', (d) => {
        const node = graph.node(d);
        const x = node?.x ?? 0;
        const y = nameLabelYCoordFactory(node);

        return `translate(${x}, ${y})`;
      });

    prepareTextGroupsWithBackgrounds(labelGroups, (group, meta) =>
      group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', libNameTextColor)
        .text(meta.name)
        .style('pointer-events', 'none'),
    );

    const versionLabelGroups = inner
      .selectAll('g.version-label')
      .data(graph.nodes())
      .enter()
      .append('g')
      .attr('class', 'version-label')
      .attr('transform', (d) => {
        const node = graph.node(d);
        const x = node?.x ?? 0;
        const y = versionLabelYCoordFactory(node);

        return `translate(${x}, ${y})`;
      });

    prepareTextGroupsWithBackgrounds(versionLabelGroups, (group, meta) =>
      group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', libNameTextColor)
        .text(meta.version)
        .style('pointer-events', 'none'),
    );

    const licenseLabelGroups = inner
      .selectAll('g.license-label')
      .data(graph.nodes())
      .enter()
      .append('g')
      .attr('class', 'license-label')
      .attr('transform', (d) => {
        const node = graph.node(d);
        const x = node?.x ?? 0;
        const y = licenseLabelYCoordFactory(node);

        return `translate(${x}, ${y})`;
      });

    prepareTextGroupsWithBackgrounds(licenseLabelGroups, (group, meta) =>
      group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', libNameTextColor)
        .text(meta.type ?? '(unknown)')
        .style('pointer-events', 'none'),
    );
  }, [
    width,
    height,
    data,
    linkColor,
    libNameTextColor,
    licenseTextColor,
    selectedNodeStrokeColor,
    graph,
    prepareTextGroupsWithBackgrounds,
  ]);

  return (
    <div ref={containerRef} className={classes.container}>
      <svg className={classes.svg} ref={svgRef}>
        <g />
      </svg>
    </div>
  );
}

const useStyles = tss.create(() => ({
  container: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  svg: {
    display: 'flex',
    flex: 1,
  },
}));

'use client';

import {
  DEFAULT_RADIUS,
  HOVER_RADIUS,
  INACTIVE_HOVER_MODE_OPACITY,
  LABEL_FONT_SIZE,
  ROOT_PROJECT_ROOT_PACKAGE_KEY,
} from '@/constants';
import { useTextGroupFactory } from '@/hooks/useTextGroupFactory';
import { useVisualizerStore } from '@/store/visualizerStore';
import type { TextCoordFactory } from '@/types/TextCoordFactory';
import { buildDependencyGraph } from '@/utils/buildDependencyGraph';
import { getLicenseWarningColor } from '@/utils/colorUtils';
import { buildPackageKey } from '@/utils/packageUtils';
import {
  licenseLabelYCoordFactory,
  nameLabelYCoordFactory,
  versionLabelYCoordFactory,
} from '@/utils/textCoordFactories';
import { LicenseCategory, type Types, analyzeLicenses } from '@callstack/licenses';
import { layout as dagreLayout } from '@dagrejs/dagre';
import { HelpTwoTone } from '@mui/icons-material';
import { Backdrop, Button, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import * as d3 from 'd3';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { tss } from 'tss-react/mui';

import Sidebar from './Sidebar';

const printNodesEdgesInDevMode = false;

export type Props = {
  data: Types.AggregatedLicensesMapping;
};

export default function DependencyGraph({ data }: Props) {
  const { width, height } = useWindowSize();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();
  const { selectedRoot, selectRoot } = useVisualizerStore();

  const [isRenderingGraph, setIsRenderingGraph] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    graph,
    incomplete: treeIncomplete,
    rootPackageKey,
  } = useMemo(() => {
    console.log('Re-generating graph...');

    const result = buildDependencyGraph(data, selectedRoot ?? undefined);

    console.log('Graph re-generated');

    return result;
  }, [data, selectedRoot]);
  const licenseAnalysis = useMemo(() => analyzeLicenses(data), [data]);

  const prepareTextGroupsWithBackgrounds = useTextGroupFactory(graph);

  useEffect(() => {
    if (treeIncomplete) {
      enqueueSnackbar({
        message:
          'Stopped parsing the tree early due to excessive depth. This is likely a bug. The tree may be INCOMPLETE.',
        variant: 'warning',
      });
    }
  }, [enqueueSnackbar, treeIncomplete]);

  const { selectedNodeStrokeColor, linkColor, labelTextColor, licenseTextColor } = useMemo(
    () =>
      theme.palette.mode === 'dark'
        ? {
            selectedNodeStrokeColor: '#fff',
            linkColor: '#999',
            labelTextColor: '#fff',
            licenseTextColor: '#fff',
          }
        : {
            selectedNodeStrokeColor: '#000',
            linkColor: '#666',
            labelTextColor: '#000',
            licenseTextColor: '#000',
          },
    [theme.palette.mode],
  );

  const graphRenderJobPendingRef = useRef<boolean>(false);
  const graphRenderJobDispatchRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Graph render dispatch effect; used for first committing a new state
   * that shows a rendering indicator, since the render procedure may take a while.
   */
  useEffect(() => {
    if (!width || !height || !svgRef.current) {
      return;
    }

    // check if another job has been delayed-dispatched
    if (graphRenderJobDispatchRef.current !== null) {
      // check if the previous job is already pending or just scheduled yet
      if (graphRenderJobPendingRef.current) {
        // if the previous job is already pending, this is a no-op
        return;
      }

      // clear the previous job if it has not started yet to start a new one in place
      clearTimeout(graphRenderJobDispatchRef.current);
    }

    console.log('Preparing to render graph...');

    setIsRenderingGraph(true);

    graphRenderJobDispatchRef.current = setTimeout(() => {
      if (graphRenderJobPendingRef.current) {
        return;
      }

      graphRenderJobPendingRef.current = true;

      console.log('Rendering new graph...', graph.nodes());

      /**
       * Creates a fill color factory for the license, based on the license category.
       * @param packageKey the package key
       * @returns the fill color for the license
       */
      function nodeFillFactory(packageKey: string) {
        const category = licenseAnalysis.categorizedLicenses[packageKey];
        const warningColor = getLicenseWarningColor(category);

        if (warningColor) {
          return warningColor.main;
        }

        return theme.palette.success.main;
      }

      const svg = d3.select(svgRef.current),
        inner = svg.select('g');

      inner.selectAll('*').remove();

      // general styling
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
          // @ts-expect-error
          inner.attr('transform', d3.zoomTransform(this));
        });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      svg.call(zoom).on('wheel.zoom', (event: WheelEvent) => {
        event.preventDefault();

        const currentZoom = svg.property('__zoom').k ?? 1.0;

        if (event.ctrlKey) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          zoom.scaleTo(svg, currentZoom * Math.pow(2.0, -event.deltaY / 100.0), d3.pointer(event));
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          zoom.translateBy(svg, -(event.deltaX / currentZoom), -(event.deltaY / currentZoom));
        }
      });

      if (process.env.NODE_ENV === 'development' && printNodesEdgesInDevMode) {
        // print nodes & edges

        console.log('Nodes');
        const nodes = graph.nodes().map((v) => {
          const node = graph.node(v);

          return {
            name: node.meta.name,
            version: node.meta.version,
            depth: node.rank,
            x: node.x,
            y: node.y,
            licenseCategory: licenseAnalysis.categorizedLicenses[v],
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

      // center the graph
      {
        const initialScale = 0.75;
        const root = graph.node(rootPackageKey);

        svg.call(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          zoom.transform,
          d3.zoomIdentity
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .translate(svg.node()!.getBoundingClientRect().width / 2 - root.x * initialScale, 100)
            .scale(initialScale),
        );
      }

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
        .style('fill', (d) => nodeFillFactory(d))
        .attr('stroke', null)
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseover', (event, d) => {
          const t = d3.transition().duration(200);
          const thisNode = graph.node(d);
          d3.select<SVGCircleElement, string>(event.currentTarget)
            .raise()
            .transition(t)
            .attr('r', HOVER_RADIUS)
            .attr('stroke-width', 3)
            .attr('stroke', selectedNodeStrokeColor)
            // below: fix for fast mouse change between nodes from different rows
            .filter((key) => key === d)
            .style('opacity', () => 1);

          links
            .transition(t)
            .style('opacity', (link) =>
              thisNode.meta.parentPackageKeys.find((key) => key === link.v || key === link.w)
                ? 1
                : INACTIVE_HOVER_MODE_OPACITY,
            );

          for (const [texts, yCoordFactory, direction] of [
            [labelGroups, nameLabelYCoordFactory, 'up'],
            [versionLabelGroups, versionLabelYCoordFactory, null],
            [licenseLabelGroups, licenseLabelYCoordFactory, 'down'],
          ] as [
            texts: d3.Selection<SVGGElement, string, d3.BaseType, unknown>,
            yCoordFactory: TextCoordFactory,
            direction: 'up' | 'down' | null,
          ][]) {
            texts.filter((pred) => pred === d).raise();

            texts.select('rect').transition(t).style('fill-opacity', 1);

            texts.transition(t).style('opacity', (pred) => {
              const predNode = graph.node(pred as string);

              return thisNode.meta.parentPackageKeys.length === 0 ||
                thisNode.meta.parentPackageKeys.includes(predNode.meta.key) ||
                predNode.meta.parentPackageKeys.find((key) => thisNode.meta.parentPackageKeys.includes(key))
                ? 1
                : INACTIVE_HOVER_MODE_OPACITY;
            });

            if (direction) {
              texts.transition(t).attr('transform', (pred) => {
                const node = graph.node(pred);

                const x = node?.x ?? 0;
                const y =
                  node.meta === thisNode.meta
                    ? yCoordFactory(node) + ((direction === 'up' ? -1 : 1) * HOVER_RADIUS) / 4
                    : yCoordFactory(node);

                return `translate(${x}, ${y})`;
              });
            }

            texts
              .transition(t)
              .select('text')
              .attr('font-size', (d) =>
                d === thisNode.meta.key ? `${LABEL_FONT_SIZE * 1.5}px` : `${LABEL_FONT_SIZE}px`,
              );
          }

          nodes
            .filter((pred) => pred !== d)
            .transition(t)
            .style('opacity', (pred) => {
              const predNode = graph.node(pred as string);

              return thisNode.meta.parentPackageKeys.length === 0 ||
                thisNode.meta.parentPackageKeys.includes(predNode.meta.key) ||
                predNode.meta.parentPackageKeys.find((key) => thisNode.meta.parentPackageKeys.includes(key))
                ? 1
                : INACTIVE_HOVER_MODE_OPACITY;
            });
        })
        .on('mouseout', () => {
          const t = d3.transition().duration(200);

          links.transition(t).style('opacity', 1);

          for (const [texts, yCoordFactory] of [
            [labelGroups, nameLabelYCoordFactory],
            [versionLabelGroups, versionLabelYCoordFactory],
            [licenseLabelGroups, licenseLabelYCoordFactory],
          ] as [texts: d3.Selection<SVGGElement, string, d3.BaseType, unknown>, yCoordFactory: TextCoordFactory][]) {
            texts.transition(t).attr('transform', (pred) => {
              const node = graph.node(pred);

              return `translate(${node.x}, ${yCoordFactory(node)})`;
            });

            texts.transition(t).style('opacity', 1);
          }

          for (const texts of [labelGroups, versionLabelGroups, licenseLabelGroups]) {
            texts.transition(t).select('text').attr('font-size', `${LABEL_FONT_SIZE}px`);
          }

          nodes
            .transition(t)
            .style('opacity', 1)
            .attr('r', DEFAULT_RADIUS)
            .attr('stroke-width', 2)
            .attr('stroke', null);
        })
        .on('click', (_event, d) => {
          const clickedLicense = graph.node(d)?.meta;

          if (clickedLicense.key === rootPackageKey) {
            selectRoot(null);
          } else {
            selectRoot(clickedLicense ?? null);
          }
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
        })
        .style('pointer-events', 'none');

      prepareTextGroupsWithBackgrounds(labelGroups, (group, meta) => {
        const packageKey = buildPackageKey(meta);
        const category = licenseAnalysis.categorizedLicenses[packageKey];

        // below: ignore just the root package
        const notIsPermissive = packageKey !== ROOT_PROJECT_ROOT_PACKAGE_KEY && category !== LicenseCategory.PERMISSIVE;

        const text = group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', `${LABEL_FONT_SIZE}px`)
          .attr('fill', labelTextColor)
          .attr('stroke', labelTextColor)
          .attr('stroke-width', 0.2)
          .text(notIsPermissive ? `${meta.name} ⚠️` : meta.name)
          .style('pointer-events', 'none');

        if (notIsPermissive) {
          text.attr('font-weight', 'bold');
        }

        return text;
      });

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

      prepareTextGroupsWithBackgrounds(
        versionLabelGroups,
        (group, meta) =>
          group
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', `${LABEL_FONT_SIZE}px`)
            .attr('fill', licenseTextColor)
            .text(meta.version)
            .style('pointer-events', 'none'),
        {
          rectFillFactory: (meta) => {
            const packageKey = buildPackageKey(meta);
            const category =
              packageKey === ROOT_PROJECT_ROOT_PACKAGE_KEY
                ? LicenseCategory.PERMISSIVE
                : licenseAnalysis.categorizedLicenses[packageKey];
            const warningColor = getLicenseWarningColor(category);

            return warningColor?.main;
          },
          backgroundRectAlpha: 1.0,
        },
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
        })
        .attr('fill', (d) => {
          const category = licenseAnalysis.categorizedLicenses[d];
          const warningColor = getLicenseWarningColor(category);

          return warningColor?.main ?? licenseTextColor;
        });

      prepareTextGroupsWithBackgrounds(licenseLabelGroups, (group, meta) => {
        const packageKey = buildPackageKey(meta);
        const category = licenseAnalysis.categorizedLicenses[packageKey];
        const warningColor = getLicenseWarningColor(category);
        const textColor =
          (theme.palette.mode === 'dark' ? warningColor?.light : warningColor?.dark) ?? licenseTextColor;

        return group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', `${LABEL_FONT_SIZE}px`)
          .attr('fill', textColor)
          .attr('stroke', theme.palette.getContrastText(theme.palette.background.default))
          .attr('stroke-width', 0.2)
          .text(meta.type ?? '(unknown)')
          .style('pointer-events', 'none');
      });

      console.log('Graph rendered');

      setIsRenderingGraph(false);
      graphRenderJobPendingRef.current = false;
      graphRenderJobDispatchRef.current = null;
    }, 1000);
  }, [
    width,
    height,
    graph,
    labelTextColor,
    licenseAnalysis.categorizedLicenses,
    licenseTextColor,
    linkColor,
    prepareTextGroupsWithBackgrounds,
    rootPackageKey,
    selectRoot,
    selectedNodeStrokeColor,
    theme.palette,
  ]);

  const rootOverride = rootPackageKey !== ROOT_PROJECT_ROOT_PACKAGE_KEY;

  return (
    <div className={classes.mainContainer}>
      <Sidebar analysis={licenseAnalysis} />

      {/* while the graph is being rendered, the JS thread may be blocked & become unresponsive; this must not be delayed e.g. via useMemo */}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isRenderingGraph}>
        <Stack alignItems="center" gap={2} justifyContent="center" direction="column">
          <CircularProgress disableShrink />
          <Typography>
            Rendering dependency graph, this may take some time based on the size of your project...
          </Typography>
        </Stack>
      </Backdrop>

      <div className={classes.flex}>
        <Stack direction="row" justifyContent="space-evenly" alignItems="center" gap={1}>
          <Typography
            textAlign="center"
            display="inline-flex"
            alignItems="center"
            whiteSpace="break-spaces"
            component="span"
          >
            🌴 Current root: <pre className={classes.inline}>{rootPackageKey}</pre>
            <Typography
              color={rootOverride ? 'warning' : undefined}
              variant="caption"
              sx={{ cursor: rootOverride ? 'pointer' : 'default' }}
              onClick={() => selectRoot(null)}
            >
              {' '}
              ({rootOverride ? 'override ⚠️ click here to reset view' : 'default'})
            </Typography>
          </Typography>

          <Typography textAlign="center" variant="caption">
            Dependency graph with {`${graph.nodes().length} nodes & ${graph.edges().length} edges`}.
          </Typography>

          <Button startIcon={<HelpTwoTone />} variant="outlined" size="small" sx={{ textTransform: 'unset' }}>
            Instructions
          </Button>
        </Stack>

        <div ref={containerRef} className={classes.container}>
          <svg className={classes.svg} ref={svgRef}>
            <g />
          </svg>
        </div>
      </div>
    </div>
  );
}

const useStyles = tss.create(() => ({
  mainContainer: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  svg: {
    display: 'flex',
    flex: 1,
  },
  sidebarHeading: {
    flex: 1,
    textAlign: 'start',
  },
  flex: {
    flex: 1,
  },
  inline: {
    display: 'inline-flex',
  },
}));

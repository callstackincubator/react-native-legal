import { LicenseCategory, Types, categorizeLicense, getLicenseCategoryDescription } from '@callstack/licenses';
import { Box, Switch, Typography, alpha } from '@mui/material';
import { blue, pink, red } from '@mui/material/colors';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import * as d3 from 'd3';
import React, { useCallback, useMemo, useState } from 'react';
import { Bar, Pie, Radar } from 'react-chartjs-2';

import { useTabsStyles } from './styles';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
);

export type ChartsProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Charts({ analysis }: ChartsProps) {
  const { classes } = useTabsStyles();

  const [categoriesBreakdownLogScale, setCategoriesBreakdownLogScale] = useState(false);

  // stacked bar chart data - categories with licenses
  const stackedBarData = useMemo(() => {
    const categories = Object.values(LicenseCategory);
    const licensesByCategory: Record<LicenseCategory, string[]> = {
      [LicenseCategory.STRONG_COPYLEFT]: [],
      [LicenseCategory.WEAK_COPYLEFT]: [],
      [LicenseCategory.PERMISSIVE]: [],
      [LicenseCategory.UNKNOWN]: [],
    };

    // group licenses by category
    Object.entries(analysis.categorizedLicenses).forEach(([license, category]) => {
      if (licensesByCategory[category]) {
        licensesByCategory[category].push(license);
      }
    });

    // create datasets for each license
    const allLicenses = Object.keys(analysis.byLicense);
    const datasets = allLicenses.map((license, index) => {
      const category = categorizeLicense(license);
      const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, allLicenses.length]);

      return {
        label: license,
        data: categories.map((cat) => (cat === category ? analysis.byLicense[license] : 0)),
        backgroundColor: colorScale(index),
        borderColor: colorScale(index),
        borderWidth: 1,
      };
    });

    return {
      labels: categories.map((cat) => getLicenseCategoryDescription(cat)),
      datasets,
    };
  }, [analysis]);

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ...(categoriesBreakdownLogScale
          ? {
              type: 'logarithmic' as const,
              min: 1,
              ticks: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback: function (value: any) {
                  return Number(value).toString();
                },
              },
            }
          : {}),
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const licenseName = context.dataset.label;
            const count = context.parsed.y;
            const percentage = ((count / analysis.total) * 100).toFixed(1);
            return `${licenseName}: ${count} (${percentage}%)`;
          },
        },
      },
    },
  };

  // radar chart data
  const radarData = useMemo(() => {
    const categories = Object.values(LicenseCategory);
    const categoryPercentages = categories.map(
      (category) => ((analysis.byCategory[category] ?? 0) / analysis.total) * 100,
    );

    const getPermissivenessLinearCombinationComponent = (category: LicenseCategory) => {
      const component = analysis.permissiveness.weightedSumComponents[category];

      return (component ? component.count * component.weight : 0) / analysis.permissiveness.totalSum;
    };

    return {
      labels: categories.map((cat) => getLicenseCategoryDescription(cat)),
      datasets: [
        {
          label: 'Packages share',
          data: categoryPercentages,
          backgroundColor: alpha(blue[500], 0.25),
          borderColor: blue[700],
          borderWidth: 2,
          pointBackgroundColor: blue[500],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: blue[500],
        },
        {
          label: 'Permissiveness score',
          data: Object.keys(analysis.permissiveness.weightedSumComponents).map((category) =>
            getPermissivenessLinearCombinationComponent(category as LicenseCategory),
          ),
          backgroundColor: alpha(red[800], 0.25),
          borderColor: pink[600],
          borderWidth: 2,
          pointBackgroundColor: pink[600],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: pink[600],
        },
      ],
    };
  }, [analysis]);
  console.log({ radarData });
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            if (context.dataset.label === 'License Distribution') {
              return `${context.label}: ${context.parsed.r.toFixed(1)}%`;
            } else {
              return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`;
            }
          },
        },
      },
    },
  };

  // license names pie chart data
  const licenseNames = Object.keys(analysis.byLicense);
  const licenseCounts = Object.values(analysis.byLicense);

  const licenseColors = useMemo(() => {
    const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, licenseNames.length]);

    return d3.range(licenseNames.length).map((i) => colorScale(i));
  }, [licenseNames]);

  const licenseNamesChartData = {
    labels: licenseNames,
    datasets: [
      {
        data: licenseCounts,
        backgroundColor: licenseColors,
        borderColor: licenseColors,
        borderWidth: 1,
      },
    ],
  };

  const licenseNamesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const percentage = ((context.parsed / analysis.total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const toggleCategoriesBreakdownLogScale = useCallback(() => {
    setCategoriesBreakdownLogScale((prev) => !prev);
  }, []);

  return (
    <Box className={classes.container}>
      <Box className={classes.gridContainer}>
        <Box className={classes.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License types in categories
          </Typography>

          {/* log scale switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Logarithmic scale</Typography>

            <Switch size="small" checked={categoriesBreakdownLogScale} onChange={toggleCategoriesBreakdownLogScale} />
          </Box>

          <Box sx={{ height: 400, position: 'relative' }}>
            <Bar data={stackedBarData} options={stackedBarOptions} />
          </Box>
        </Box>

        <Box className={classes.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License type distribution
          </Typography>

          <Box sx={{ height: 400, position: 'relative' }}>
            <Pie data={licenseNamesChartData} options={licenseNamesChartOptions} />
          </Box>
        </Box>

        <Box className={classes.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License category distribution
          </Typography>

          <Box sx={{ height: 400, position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

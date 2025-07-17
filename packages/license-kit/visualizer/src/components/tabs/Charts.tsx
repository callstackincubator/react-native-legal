import React, { useCallback, useMemo, useState } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  LogarithmicScale,
} from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import * as d3 from 'd3';

import { useTabsStyles } from './styles';
import { LicenseAnalysisResult } from '@/types/LicenseAnalysisResult';
import { LicenseCategory } from '@/types/LicenseCategory';
import { categorizeLicense, getLicenseCategoryDescription } from '@/utils/licenseAnalysis';

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
  analysis: LicenseAnalysisResult;
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

  // Radar chart data
  const radarData = useMemo(() => {
    const categories = Object.values(LicenseCategory);
    const categoryPercentages = categories.map((category) => {
      const count = analysis.byCategory[category] || 0;
      return (count / analysis.total) * 100;
    });

    return {
      labels: categories.map((cat) => getLicenseCategoryDescription(cat)),
      datasets: [
        {
          label: 'License Distribution',
          data: categoryPercentages,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        },
        {
          label: 'Permissiveness Score',
          data: [
            analysis.permissivenessScore,
            analysis.permissivenessScore,
            analysis.permissivenessScore,
            analysis.permissivenessScore,
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    };
  }, [analysis]);

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
        <Box className={classes.licensesContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License Categories Breakdown
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

        <Box className={classes.licensesContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License Distribution Overview
          </Typography>

          <Box sx={{ height: 400, position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </Box>
        </Box>

        <Box className={classes.licensesContainer}>
          <Typography variant="subtitle1" gutterBottom>
            Licenses distribution
          </Typography>

          <Box sx={{ height: 400, position: 'relative' }}>
            <Pie data={licenseNamesChartData} options={licenseNamesChartOptions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

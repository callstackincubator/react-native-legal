import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  LicenseCategory,
  STRONG_COPYLEFT_LICENSES_LOWERCASE,
  WEAK_COPYLEFT_LICENSES_LOWERCASE,
  analyzeLicenses,
  categorizeLicense,
  scanDependencies,
} from '@callstack/licenses';
import { bold, green, italic, red, underline, whiteBright, yellow } from 'colorette';
import type { Command } from 'commander';
import { type TableUserConfig, getBorderCharacters, table } from 'table';

import { createScanOptionsFactory } from '../scanOptionsUtils';
import { curryCommonScanOptions } from '../utils/commandUtils';

const tableConfig: TableUserConfig = {
  border: getBorderCharacters('norc'),
};

function getScoreColor(score: number): (text: string) => string {
  if (score >= 80) return green;
  if (score >= 60) return yellow;
  return red;
}

const categoryToEmojiMapping: Record<LicenseCategory, string> = {
  [LicenseCategory.PERMISSIVE]: '🔓',
  [LicenseCategory.WEAK_COPYLEFT]: '🟡',
  [LicenseCategory.STRONG_COPYLEFT]: '🔒',
  [LicenseCategory.UNKNOWN]: '❓',
};

function getLicenseColor(license: string): string {
  if (license === 'unknown') return yellow(license);

  if (WEAK_COPYLEFT_LICENSES_LOWERCASE.has(license)) return yellow(license);

  if (STRONG_COPYLEFT_LICENSES_LOWERCASE.has(license)) return red(license);

  return license;
}

export default function analyzeCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
    program
      .command('analyze')
      .description(
        'Scan licenses & report the insights: calculate permissiveness score (weighted average of points preset for given types), top license types, optionally unknowns & breakdown of licenses by different features.',
      )
      .option('--root [path]', 'Path to the root of your project', '.')
      .option('--list-unknown', 'List unknown licenses', false)
      .option('--show-breakdown', 'Show breakdown of licenses by category and type', false),
  ).action((options) => {
    const repoRootPath = path.resolve(process.cwd(), options.root);
    const packageJsonPath = path.join(repoRootPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.error(`package.json not found at ${packageJsonPath}`);
      process.exit(1);
    }

    const { name = null } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (name) {
      console.log(underline(`Project: ${whiteBright(name)} 💼`));
    }

    console.log();

    const licenses = scanDependencies(packageJsonPath, createScanOptionsFactory(options));

    const {
      permissiveness: { score: permissivenessScore },
      byCategory,
      byLicense,
      categorizedLicenses,
      total,
    } = analyzeLicenses(licenses);

    console.log();

    const permissivenessColor = getScoreColor(permissivenessScore);

    console.log(`📦 ${bold('Total packages')}: ${whiteBright(total)}`);
    console.log(`🔓 ${permissivenessColor('Permissiveness')} score: ${permissivenessColor(`${permissivenessScore}%`)}`);
    const byLicenseEntries = Object.entries(byLicense);

    console.log(
      `🧮 ${underline('Top 5')} licenses in your project: ${byLicenseEntries
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([license, count]) => `${whiteBright(license)} (${count})`)
        .join(', ')} ${
        byLicenseEntries.length > 5 ? italic(yellow(` + ${byLicenseEntries.length - 5} more (see below)`)) : ''
      }`,
    );

    console.log();

    // breakdown of categories checklist
    const unknownCount = byCategory[LicenseCategory.UNKNOWN];
    const hasUnknown = unknownCount > 0;

    const copyleftCount = byCategory[LicenseCategory.STRONG_COPYLEFT];
    const hasCopyleft = copyleftCount > 0;

    const weakCopyleftCount = byCategory[LicenseCategory.WEAK_COPYLEFT];
    const hasWeakCopyleft = weakCopyleftCount > 0;

    console.log(
      `${categoryToEmojiMapping[LicenseCategory.STRONG_COPYLEFT]} Copyleft licenses: ${(hasCopyleft ? red : green)(
        copyleftCount,
      )} ${hasCopyleft ? '⚠️' : '✅'}`,
    );
    console.log(
      `${categoryToEmojiMapping[LicenseCategory.WEAK_COPYLEFT]} Weak copyleft licenses: ${(hasWeakCopyleft
        ? yellow
        : green)(weakCopyleftCount)} ${hasWeakCopyleft ? '⚠️' : '✅'}`,
    );
    console.log(
      `${categoryToEmojiMapping[LicenseCategory.UNKNOWN]} Unknown licenses: ${(hasUnknown ? yellow : green)(
        unknownCount,
      )} ${hasUnknown ? '⚠️' : '✅'}`,
    );
    console.log(
      `${categoryToEmojiMapping[LicenseCategory.PERMISSIVE]} Permissive licenses: ${green(
        byCategory[LicenseCategory.PERMISSIVE],
      )}`,
    );

    if (options.listUnknown) {
      console.log();
      console.log('―'.repeat(process.stdout.columns));
      console.log();

      console.log(`🔍 ${whiteBright('Unknown licenses')}`);
      console.log(
        table(
          Object.entries(licenses)
            .filter(([_packageKey, license]) => categorizeLicense(license.type) === LicenseCategory.UNKNOWN)
            .map(([packageKey]) => [packageKey]),
          tableConfig,
        ),
      );
    }

    if (options.showBreakdown) {
      console.log();
      console.log('―'.repeat(process.stdout.columns));
      console.log();

      // licenses by category
      const byCategoryTable: (string | number)[][] = [['Category', 'Count', 'Percentage']];

      Object.entries(byCategory).forEach(([category, count]) => {
        byCategoryTable.push([category, count, Number(((count / total) * 100).toFixed(2))]);
      });

      console.log(`🗂️  Licenses by ${whiteBright('category')}`);
      console.log(table(byCategoryTable, tableConfig));

      console.log();

      // licenses by type
      const byLicenseTable: (string | number)[][] = [['License', 'Count', 'Percentage']];

      byLicenseEntries
        .sort(([, a], [, b]) => b - a)
        .forEach(([license, count]) => {
          byLicenseTable.push([
            license === 'unknown' ? yellow(license) : getLicenseColor(license),
            count,
            Number(((count / total) * 100).toFixed(2)),
          ]);
        });

      console.log(`🏷️  Licenses by ${whiteBright('type')}`);
      console.log(table(byLicenseTable, tableConfig));

      console.log();

      const nonFullyPermissiveObj = [
        ['License', 'Category'],
        ...Object.entries(categorizedLicenses)
          .filter(([_license, category]) => category !== LicenseCategory.PERMISSIVE)
          .map(([license, category]) => [license, `${category} ${categoryToEmojiMapping[category]}`]),
      ];

      // non-permissive licenses
      if (nonFullyPermissiveObj.length > 0) {
        console.log(`⚠️  ${whiteBright('Non-fully-permissive')} licenses`);
        console.log(table(nonFullyPermissiveObj, tableConfig));
      } else {
        console.log(`✅  ${whiteBright('All licenses are fully-permissive')}`);
      }
    }
  });
}

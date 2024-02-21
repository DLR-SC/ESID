// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * This script collects all attributions from our production dependencies and outputs them as a JSON file to
 * `assets/third-party-attributions.json`.
 */

import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import fetch from 'node-fetch';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Generic license texts are being cached here, since some projects don't provide any, and we have to download them.*/
const LICENSE_CACHE = new Map<string, string>();

const LICENSES = new Map<string, number>();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const NODE_MODULES = path.resolve(PROJECT_ROOT, 'node_modules');
const PACKAGE_JSON = path.resolve(PROJECT_ROOT, 'package.json');

(async () => {
  console.info('Starting to collect the dependencies ...');

  // Read the dependencies section from the root package.json and save it as a set of strings.
  const allDependencies = new Set<string>(
    Object.keys(JSON.parse(fs.readFileSync(PACKAGE_JSON).toString()).dependencies)
  );
  // We go through all dependencies and get their sub dependencies until we can find no more.
  const visitedDependencies = new Set<string>();
  do {
    new Set([...Array.from(allDependencies)].filter((d) => !visitedDependencies.has(d))).forEach((lib) => {
      getDirectDependencies(lib).forEach((dep) => allDependencies.add(dep));
      visitedDependencies.add(lib);
    });
  } while (allDependencies.size > visitedDependencies.size);
  console.info(
    'Finished collecting dependencies.',
    `Found ${allDependencies.size} direct and indirect dependencies.`,
    '\n'
  );

  console.info('Starting to collect dependency data ...');
  // Now that we have all dependencies, we go through each one and collect all the attribution data we can find.
  const dependencyData: Array<DependencyData> = [];
  for (const lib of Array.from(allDependencies)) {
    try {
      dependencyData.push(await getDependencyData(lib));
    } catch (error) {
      // handle rejected promise returned if dependency not found/resolved
      console.warn(`Could not get dependency data for ${lib}!`);
    }
  }
  console.info('Finished collecting dependency data.', '\n');

  console.info('The following licenses are used by the dependencies:');
  LICENSES.forEach((occurrences: number, license: string) => {
    console.info(`${occurrences.toString().padStart(4)}x ${license}`);
  });
  console.info();

  console.info('Writing to disk ...');
  fs.writeFileSync(`${PROJECT_ROOT}/assets/third-party-attributions.json`, JSON.stringify(dependencyData));
  console.info('Done!');
})();

/**
 * This function gets the direct dependencies of a library by opening the package.json and reading the dependencies
 * section.
 *
 * @param lib The library name to get the direct dependencies from.
 */
function getDirectDependencies(lib: string): Array<string> {
  try {
    const json = JSON.parse(fs.readFileSync(`${NODE_MODULES}/${lib}/package.json`).toString());
    return json?.dependencies ? Object.keys(json.dependencies) : [];
  } catch (error) {
    console.warn(`package.json of ${lib} not found!`);
    return [];
  }
}

/**
 * This function tries to collect as much attribution data from a library as possible. If it can't find a specific piece
 * of information, it prints a warning.
 *
 * @param lib The library name to collect the data from.
 */
async function getDependencyData(lib: string): Promise<DependencyData> {
  try {
    const json = JSON.parse(fs.readFileSync(`${NODE_MODULES}/${lib}/package.json`).toString());

    const authors = getAuthors(json);
    if (authors === null) {
      console.warn(`No author information for '${lib}' could be found!`);
    }

    const version = json?.version;
    if (version === null) {
      console.warn(`No version for '${lib}' could be found!`);
    }

    const repositoryURL = getRepositoryURL(json);
    if (repositoryURL === null) {
      console.warn(`No repository url for '${lib}' could be found!`);
    }

    const licenseType = getLicenseType(json);
    if (licenseType === null) {
      console.warn(`No license type for '${lib}' could be found!`);
    } else {
      if (LICENSES.has(licenseType)) {
        LICENSES.set(licenseType, LICENSES.get(licenseType)!! + 1);
      } else {
        LICENSES.set(licenseType, 1);
      }
    }

    const licenseText = await getLicenseText(lib, licenseType, authors);
    if (licenseText === null) {
      console.warn(`No license text for '${lib}' could be found!`);
    }

    return {
      name: lib,
      authors: authors,
      version: version,
      repository: repositoryURL,
      license: licenseType,
      licenseText: licenseText,
    };
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Try to get the authors of a library. Sadly the author information is provided differently by different libraries.
 *
 * @param packageJSON The package.json contents of the library.
 */
function getAuthors(packageJSON: any): string | null {
  if (packageJSON.author && typeof packageJSON.author === 'string') {
    return packageJSON.author;
  } else if (packageJSON.author && typeof packageJSON.author === 'object' && packageJSON.author.name) {
    return packageJSON.author.name;
  } else if (packageJSON.contributors) {
    return packageJSON.contributors.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ');
  } else if (packageJSON.authors) {
    return packageJSON.authors.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ');
  } else if (packageJSON.maintainers) {
    return packageJSON.maintainers.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ');
  }

  return null;
}

/**
 * Try to get the repository URL of a library.
 *
 * @param packageJSON The package.json contents of the library.
 */
function getRepositoryURL(packageJSON: any): string | null {
  if (packageJSON.repository) {
    if (typeof packageJSON.repository === 'string') {
      return packageJSON.repository;
    } else if (packageJSON.repository.url) {
      return packageJSON.repository.url;
    }
  }

  return null;
}

/**
 * Try to find out which license the library uses.
 *
 * @param packageJSON The package.json contents of the library.
 */
function getLicenseType(packageJSON: any): string | null {
  if (packageJSON.license) {
    if (typeof packageJSON.license === 'string') {
      return packageJSON.license;
    } else if (packageJSON.license.type) {
      return packageJSON.license.type;
    }
  }

  return null;
}

/**
 * This function tries to get the license text of a library. There is sadly no standard, on how it is provided.
 *
 * @param lib The name of the library.
 * @param license The name of the license the library uses. This is used to download a license file, if none is found.
 * @param author The name of the author(s) of the library. This is used to fill in missing data to a license file.
 */
async function getLicenseText(lib: string, license: string | null, author: string | null): Promise<string | null> {
  const libRoot = `${NODE_MODULES}/${lib}`;

  // First we search for files that have fitting names for license files.
  const files = fs.readdirSync(libRoot);
  const possibleLicenseFiles = files.filter(
    (fileName) => fileName.toLowerCase().includes('license') || fileName.toLowerCase().includes('licence')
  );

  if (possibleLicenseFiles.length > 0) {
    return fs.readFileSync(`${libRoot}/${possibleLicenseFiles[0]}`).toString();
  } else if (license) {
    // If no license file is found, we try to get a generic license file from GitHub using the name of the license.
    let licenseText: string | undefined = undefined;
    if (LICENSE_CACHE.has(license)) {
      // License texts are cached to minimize requests to GitHub.
      licenseText = LICENSE_CACHE.get(license);
    } else {
      const response = await fetch(`https://api.github.com/licenses/${license}`);
      const licenseJSON = (await response.json()) as any;
      if (licenseJSON.body) {
        licenseText = licenseJSON.body;
        LICENSE_CACHE.set(license, licenseText!);
      }
    }

    // When a license text was successfully downloaded, the name and year are filled in, if possible.
    if (licenseText) {
      return licenseText.replace('[year]', new Date().getUTCFullYear().toString()).replace('[fullname]', author || '');
    }
  }

  return null;
}

interface DependencyData {
  name: string;
  version: string | null;
  authors: string | null;
  repository: string | null;
  license: string | null;
  licenseText: string | null;
}

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

/** Generic license texts are being cached here, since some projects don't provide any, and we have to download them.*/
const LICENSE_CACHE = new Map<string, string>();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const NODE_MODULES = path.resolve(PROJECT_ROOT, 'node_modules');
const PACKAGE_JSON = path.resolve(PROJECT_ROOT, 'package.json');

(async () => {
  console.info('Starting to collect the dependencies ...');
  const allDependencies = new Set<string>(Object.keys(JSON.parse(fs.readFileSync(PACKAGE_JSON).toString()).dependencies));
  const visitedDependencies = new Set<string>();
  do {
    new Set([...Array.from(allDependencies)].filter(d => !visitedDependencies.has(d))).forEach(lib => {
      getDirectDependencies(lib).forEach(dep => allDependencies.add(dep));
      visitedDependencies.add(lib);
    });
  } while (allDependencies.size > visitedDependencies.size);
  console.info('Finished collecting dependencies.', `Found ${allDependencies.size} direct and indirect dependencies.`, '\n');

  console.info('Starting to collect dependency data ...');
  const dependencyData: Array<DependencyData> = [];
  for (const lib of Array.from(allDependencies)) {
    dependencyData.push(await getDependencyData(lib));
  }
  console.info('Finished collecting dependency data.', '\n');

  console.info('Writing to disk ...');
  fs.writeFileSync(`${PROJECT_ROOT}/public/assets/third-party-attributions.json`, JSON.stringify(dependencyData));
  console.info('Done!');
})();

/**
 *
 * @param lib
 */
function getDirectDependencies(lib: string): Array<string> {
  const json = JSON.parse(fs.readFileSync(`${NODE_MODULES}/${lib}/package.json`).toString());
  return json && json.dependencies ? Object.keys(json.dependencies) : [];
}

async function getDependencyData(lib: string): Promise<DependencyData> {
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
}

function getAuthors(packageJSON: any): string | null {
  if (packageJSON.author && typeof packageJSON.author === 'string') {
    return packageJSON.author;
  } else if (packageJSON.author && typeof packageJSON.author === 'object' && packageJSON.author.name) {
    let author = packageJSON.author.name;
    if (packageJSON.author.email) {
      author += ` <${packageJSON.author.email}>`;
    }
    return author;
  } else if (packageJSON.contributors) {
    return packageJSON.contributors.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
  } else if (packageJSON.authors) {
    return packageJSON.authors.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
  } else if (packageJSON.maintainers) {
    return packageJSON.maintainers.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
  }

  return null;
}

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

async function getLicenseText(lib: string, license: string | null, author: string | null): Promise<string | null> {
  const libRoot = `${NODE_MODULES}/${lib}`;

  const files = fs.readdirSync(libRoot);
  const possibleLicenseFiles = files.filter(fileName => fileName.toLowerCase().includes('license') || fileName.toLowerCase().includes('licence'));

  if (possibleLicenseFiles.length > 0) {
    return fs.readFileSync(`${libRoot}/${possibleLicenseFiles[0]}`).toString();
  } else if (license) {
    let licenseText = null;
    if (LICENSE_CACHE.has(license)) {
      licenseText = LICENSE_CACHE.get(license);
    } else {
      const response = await fetch(`https://api.github.com/licenses/${license}`);
      const licenseJSON = await response.json();
      if (licenseJSON.body) {
        licenseText = licenseJSON.body;
        LICENSE_CACHE.set(license, licenseText);
      }
    }

    if (licenseText) {
      return licenseText.replace('[year]', new Date().getUTCFullYear()).replace('[fullname]', author || '');
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

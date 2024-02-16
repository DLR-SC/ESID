<p align="center"> 
  <img src ="frontend/docs/images/logo-200x66.svg" />
</p>

<p align="center"> 
  <img src ="frontend/docs/images/Overview.png" />
</p>

---
<img src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white" height="20px">
<img src="https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E" height="20px">

[![REUSE](https://api.reuse.software/badge/github.com/DLR-SC/ESID)](https://api.reuse.software/info/github.com/DLR-SC/ESID)
[![Coverage Status](https://coveralls.io/repos/github/DLR-SC/ESID/badge.svg?branch=develop)](https://coveralls.io/github/DLR-SC/ESID?branch=develop)
[![documentation](https://img.shields.io/badge/Docs-online-34D058.svg)](docs/README.md)
[![license](https://img.shields.io/github/license/DLR-SC/ESID.svg)](LICENSE) 


# ESID - Epidemiological Scenarios for Infectious Diseases
> 📘 **Abstract**  
> ESID is a visual analytics tool to visualize and compare scenarios of infectious disease propagation developed at the [German Aerospace Center (DLR)](https://www.dlr.de/).
> It allows displaying historical data, as well as analyzing simulation results of pandemic scenarios in multiple, connected views across spatial and temproal domains.

<!-- omit from toc -->
## Table of Contents
- [Features](#features)
- [Quickstart Guide](#quickstart-guide)
- [Developer Documentation](#developer-documentation)
- [Contributing to ESID](#contributing-to-esid)
- [Contributor Covenant Code of Conduct](#contributor-covenant-code-of-conduct)
- [Contributors](#contributors)
- [License](#license)

---

## Features
- Data Cards for direct comparison of key values between scenarios.
- District overview map to compare the spatial development of scenarios.
- Line chart with date selection and uncerainty display to compare temporal changes in scenario values
- Inter-connected views adapting to context and selected filters

> [!TIP]  
> You can find a list of the latest changes in the [changelog](/frontend/docs/changelog/changelog-en.md).[^changelog-de]

[^changelog-de]: The changelog is also available in german [here](/frontend/docs/changelog/changelog-de.md).


## Quickstart Guide
> [!IMPORTANT]
To build the frontend you need to download and install _Node.js_, and the _Node Package Manager_ (npm). You can
download the latest release from their website: [NodeJS.org](https://nodejs.org/en/)

First, clone this repository to your computer:
```bash
git clone git@github.com:DLR-SC/ESID.git
cd ESID
git checkout develop
```
> [!NOTE]  
> The `develop` branch contains our latest developed features as outlined in our [Branching Strategy](/frontend/README.md#branching-strategy).

Next, initialize the project by downloading and installing its dependencies:
```bash
cd frontend
npm install
```

Once the dependencies are installed you can launch it locally with:
```bash
npm run start
```
This will host a server at [localhost:8080](http://localhost:8080/), where the website will be displayed.

> [!TIP]  
> For further information please check the [Developer Documentation](#developer-documentation) below.

## Developer Documentation
You can find the developer documentation for the front- and backend in the corresponding folders:
- [Backend Developer Documentation](backend/README.md)
- [Frontend Developer Documentation](frontend/README.md)


## Contributing to ESID
> [!IMPORTANT]  
> Whenever you encounter a :beetle: **bug** or have a :tada: **feature request**, report this via [Github issues](https://github.com/DLR-SC/ESID/issues).

We are always happy to receive contributions to ESID in the form of **pull requests** via Github.
Feel free to fork the repository, add your changes and create a pull request to the `develop` branch.

There is a [forking guide in the developer guidelines](frontend/README.md#forking-esid) available to get you started quickly!


## Contributor Covenant Code of Conduct
> [!NOTE]  
> Our Code of Conduct can be found [here](CODE_OF_CONDUCT.md).

## Contributors
<details>
<summary>Current Contributors</summary>

**German Aerospace Center (DLR):**
- Martin Kühn
- Jonas Gilg
- Luca Spataro
- Moritz Zeumer
- Pawandeep Kaur-Betz

</details>
<details>
<summary>Previous Contributors</summary>

**German Aerospace Center (DLR):**
- Margrit Klitz
- Kerem Balci
- Selma Dahmani
- Laurin Kerkloh

**Hochschule für Gestaltung Schwäbisch Gmünd (HfG):**
- Julien Stoll
- Valerie Grappendorf

</details>

## License
> [!NOTE]  
> Copyright 2021-2023 German Aerospace Center (DLR)
> 
> Our license can be found [here](LICENSE).

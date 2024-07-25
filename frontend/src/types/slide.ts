// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

interface Slide {
  title: string;
  content: string;
}

interface Slides {
  [key: string]: Slide[];
}

export type {Slide, Slides};

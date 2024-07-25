interface Slide {
  title: string;
  content: string;
}

interface Slides {
  [key: string]: Slide[];
}

export type {Slide, Slides};

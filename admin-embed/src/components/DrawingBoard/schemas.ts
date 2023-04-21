export interface RectangleItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawingBoardState {
  selected: string | null;
  aspectRatio: number;
  width: number;
  backgroundImageSrc: string | null; // TODO
  shapes: {
    [key: string]: RectangleItem;
  };
}

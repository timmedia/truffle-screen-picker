export interface RectangleItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawingBoardState {
  selected: string | null;
  id: string;
  aspectRatio: number;
  width: number;
  backgroundImageSrc: string | null; // TODO
  name: string;
  areas: {
    [key: string]: RectangleItem;
  };
}

import { DrawingBoardState } from "./schemas";

export const shapesSelector = (state: DrawingBoardState) =>
  Object.entries(state.shapes);

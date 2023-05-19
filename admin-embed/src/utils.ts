import { CSSProperties } from "react";

export function camelCaseToKebabCase(value: string) {
  return value.replace(new RegExp(/[A-Z]/g), (v) => `-${v.toLowerCase()}`);
}

export function cssPropertiesToKebabCase(props: CSSProperties) {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      camelCaseToKebabCase(key),
      value,
    ])
  );
}

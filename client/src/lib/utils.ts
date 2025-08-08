import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseJSON = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

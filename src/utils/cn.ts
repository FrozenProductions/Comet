import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class values into a single string using clsx and tailwind-merge
 * @param inputs - Array of class values to be merged
 * @returns A string containing all merged and deduplicated class names
 */
export function mergeClasses(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

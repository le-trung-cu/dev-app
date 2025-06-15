import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function snakeCaseToTitleCase(str: string) {
//   return str.toLowerCase()
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (char) => char.toUpperCase())
// };



export function camelCaseToTitleCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")        // thêm khoảng trắng trước chữ in hoa
    .replace(/^./, str => str.toUpperCase()) // viết hoa chữ cái đầu tiên
    .trim();                           
};

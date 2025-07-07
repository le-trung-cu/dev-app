import { clsx, type ClassValue } from "clsx";
import rgba from "color-rgba";
import { format, isToday, isYesterday } from "date-fns";
import { RGBColor } from "react-color";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function snakeCaseToTitleCase(str: string) {
//   return str.toLowerCase()
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (char) => char.toUpperCase())
// };

export function camelCaseToTitleCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1") // thêm khoảng trắng trước chữ in hoa
    .replace(/^./, (str) => str.toUpperCase()) // viết hoa chữ cái đầu tiên
    .trim();
}

export function rgbaObjectToString(rgba: RGBColor | "transparent") {
  if (rgba === "transparent") {
    return `rgba(0,0,0,0)`;
  }

  const alpha = rgba.a === undefined ? 1 : rgba.a;

  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
}

export function stringToRGBObject(color: string) {
  const [r, g, b, a] = rgba(color);

  return { r, g, b, a } as RGBColor;
}

export function formatFullTime (date: Date) {
  return `${isToday(date) ? "Hôm nay" : isYesterday(date) ? "Hôm qua" : format(date, "MMM d, yyyy")} vào lúc ${format(date, "h:mm:ss a")}`;
};
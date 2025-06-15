import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Tên project là bắt buộc"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Tên project là bắt buộc").optional(),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
});

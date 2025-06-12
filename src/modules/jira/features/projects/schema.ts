import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
})
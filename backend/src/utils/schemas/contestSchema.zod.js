const { z } = require("zod");

const contestSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  
  problems: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid problem ObjectId")
  ).min(1, "At least one problem is required"),

  startTime: z.string().datetime({ message: "startTime must be a valid ISO date" }),
  endTime: z.string().datetime({ message: "endTime must be a valid ISO date" }),
});

module.exports = contestSchema;

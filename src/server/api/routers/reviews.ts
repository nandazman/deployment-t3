import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        visited: z.number(),
        category: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const reviews = await ctx.prisma.review.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          visited: input.visited,
          category: input.category,
        },
      });
      return reviews;
    }),
  create: publicProcedure
    .input(
      z.object({
        restaurant: z.string().min(1).max(255),
        rating: z.number().min(1).max(5),
        description: z.string(),
        photos: z.string(),
        category: z.number().min(1).max(2),
        location: z.string().min(1).max(255),
        price: z.number().min(1),
        website: z.string().min(1).max(255),
        visited: z.number().min(0).max(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.create({
        data: input,
      });

      return review;
    }),
});

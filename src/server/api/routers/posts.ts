// import clerkClient, { type User } from "@clerk/clerk-sdk-node";
// import { TRPCError } from "@trpc/server";
// import { z } from "zod";

// import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

// const filterUserForClient = (user: User) => {
//   return {
//     id: user.id,
//     username: user.username,
//     name: `${user.firstName || ""} ${user.lastName || ""}`,
//     profileImageUrl: user.profileImageUrl,
//   };
// }

// export const postRouter = createTRPCRouter({
//   getAll: publicProcedure.query(async ({ ctx }) => {
//     const posts = await ctx.prisma.post.findMany({
//       take: 100,
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const users = (
//       await clerkClient.users.getUserList({
//         userId: posts.map((post) => post.userId),
//       })
//     ).map(filterUserForClient);
//     return posts.map((post) => {
//       const user = users.find((user) => user.id === post.userId);
//       if (!user)
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "User for post not found",
//         });
//       return {
//         post,
//         user,
//         test: 2
//       };
//     });
//   }),

//   create: privateProcedure
//     .input(
//       z.object({
//         content: z.string().emoji("Only emojis are allowed").min(1).max(280),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       const userId = ctx.userId;

//       const post = await ctx.prisma.post.create({
//         data: {
//           userId,
//           content: input.content,
//         },
//       });

//       return post;
//     }),
// });

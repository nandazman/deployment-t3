import clerkClient, { User } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  console.log({ user })
  return {
    id: user.id,
    username: user.username,
    name: `${user.firstName || ""} ${user.lastName || ""}`,
    profileImageUrl: user.profileImageUrl,
  };
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.userId),
      })
    ).map(filterUserForClient);
    return posts.map((post) => {
      const user = users.find((user) => user.id === post.userId)
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User for post not found" })
      return {
        post,
        user,
      };
    })
  }),
});

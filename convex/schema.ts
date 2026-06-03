import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),

  // Used by `src/app/test/page.tsx`.
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.optional(v.boolean()),
  }),

  // Example table used by `convex/myFunctions.ts`.
  numbers: defineTable({
    value: v.number(),
  }),

  members:defineTable({
    userId:v.id("users"),
    workspaceId:v.id("workspaces"),
    role:v.union(v.literal("admin"),v.literal("member"))

  })
  .index("by_user_id",["userId"])
  .index("by_workspace_id",["workspaceId"])
  .index("by_workspace_id_user_id",["workspaceId","userId"]),


  channels:defineTable({
    name:v.string(),
    workspaceId:v.id("workspaces"),
   // isPrivate:v.boolean()
  })
  .index("by_workspace_id",["workspaceId"]),



});

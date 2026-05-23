import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";


const JOIN_CODE_LENGTH = 6;
const JOIN_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

const generateCode = () => {
    let code = "";
    for (let i = 0; i < JOIN_CODE_LENGTH; i += 1) {
        const index = Math.floor(Math.random() * JOIN_CODE_ALPHABET.length);
        code += JOIN_CODE_ALPHABET[index];
    }
    return code;
};


export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }
        //JoinCode

        const joinCode = generateCode();

        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name,
            userId,
            joinCode,
        });

        await ctx.db.insert("members", {
            userId,
            workspaceId,
            role: "admin"
        });


        // const workspace=await ctx.db.get(workspaceId);

        return workspaceId;
    }
});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return [];
        }

        const members = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        const workspaceIds = members.map((member) => member.workspaceId);

        const workspaces = [];
        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId);
            if (workspace) {
                workspaces.push(workspace);

            }
        }


        return workspaces;

    }
})

export const getById = query({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {

        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized")
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.id).eq("userId", userId))
            .unique();
        if (!member)
            return []
        return await ctx.db.get(args.id);
    }
})
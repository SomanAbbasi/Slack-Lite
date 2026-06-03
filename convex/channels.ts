import { query } from "./_generated/server";
import { auth } from "./auth";
import {v} from "convex/values";
export const get=query({
    args:{

        workspaceId:v.id("workspaces")  


    },



    handler:async(ct,args)=>{
        const userId=await auth.getUserId(ct);
        if(!userId){
            return [];

       
        }
        const member=await ct.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",args.workspaceId).eq("userId",userId)).unique();
        if(!member){
            return [];
        }

        const channels=await ct.db.query("channels").withIndex("by_workspace_id",(q)=>q.eq("workspaceId",args.workspaceId)).collect();

        return channels;

    },

});

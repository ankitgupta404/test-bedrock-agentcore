"use strict";var p=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var N=Object.prototype.hasOwnProperty;var $=(e,t)=>{for(var s in t)p(e,s,{get:t[s],enumerable:!0})},T=(e,t,s,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of D(t))!N.call(e,n)&&n!==s&&p(e,n,{get:()=>t[n],enumerable:!(r=M(t,n))||r.enumerable});return e};var C=e=>T(p({},"__esModule",{value:!0}),e);var _={};$(_,{handler:()=>L});module.exports=C(_);var h=require("@aws-sdk/client-dynamodb"),a=require("@aws-sdk/lib-dynamodb"),v=new h.DynamoDBClient({}),I=a.DynamoDBDocumentClient.from(v,{marshallOptions:{removeUndefinedValues:!0}}),g=process.env.TABLE_NAME;async function R(e){await I.send(new a.PutCommand({TableName:g,Item:{PK:`USER#${e.userId}`,SK:`SUMMARY#${e.date}#${e.summaryId}`,GSI1PK:`SUMMARY#${e.summaryId}`,GSI1SK:`USER#${e.userId}`,summaryId:e.summaryId,userId:e.userId,date:e.date,sections:e.sections,createdAt:e.createdAt}}))}async function E(){return((await I.send(new a.ScanCommand({TableName:g,FilterExpression:"SK = :sk AND size(interests) > :zero",ExpressionAttributeValues:{":sk":"PROFILE",":zero":0}}))).Items||[]).map(t=>({userId:t.userId,email:t.email,interests:t.interests||[],preferencePrompt:t.preferencePrompt,createdAt:t.createdAt,updatedAt:t.updatedAt}))}async function b(e,t=5){return((await I.send(new a.QueryCommand({TableName:g,KeyConditionExpression:"PK = :pk AND begins_with(SK, :prefix)",ExpressionAttributeValues:{":pk":`USER#${e}`,":prefix":"FEEDBACK#"},ScanIndexForward:!1,Limit:t}))).Items||[]).map(r=>({feedbackId:r.feedbackId,summaryId:r.summaryId,userId:r.userId,rating:r.rating,comment:r.comment,createdAt:r.createdAt}))}var m=require("@aws-sdk/client-bedrock-runtime"),O=new m.BedrockRuntimeClient({}),F=process.env.BEDROCK_MODEL_ID||"anthropic.claude-3-sonnet-20240229-v1:0";async function P(e,t,s){let r=new Date().toISOString().split("T")[0],n=`You are a daily research agent. Your job is to provide comprehensive, high-quality research summaries on specified topics. 

You must respond ONLY with valid JSON matching this schema:
{
  "sections": [
    {
      "interest": "topic name",
      "highlights": [
        {
          "title": "Brief title of the update",
          "summary": "2-3 sentence summary of the finding",
          "sourceUrl": "https://example.com (optional, use realistic placeholder URLs)",
          "relevance": "Why this matters to the reader"
        }
      ]
    }
  ]
}

Guidelines:
- Provide 2-4 highlights per interest area
- Keep summaries concise but informative
- Focus on the most recent and relevant developments
- Tailor depth and style based on user preferences and feedback`,d=`Generate a research summary for today (${r}).

Interest areas: ${e.join(", ")}

${t?`User preferences: ${t}`:""}

${s?`Previous feedback to incorporate:
${s}`:""}

Provide the research summary as JSON.`,c={anthropic_version:"bedrock-2023-05-31",max_tokens:4096,system:n,messages:[{role:"user",content:d}]},u=new m.InvokeModelCommand({modelId:F,contentType:"application/json",accept:"application/json",body:JSON.stringify(c)}),l=await O.send(u),y=JSON.parse(new TextDecoder().decode(l.body)).content?.[0]?.text||"{}",f=y,A=y.match(/```(?:json)?\s*([\s\S]*?)```/);A&&(f=A[1].trim());try{return JSON.parse(f)}catch{return{sections:e.map(S=>({interest:S,highlights:[{title:"Research summary generation in progress",summary:"The AI agent is still learning your preferences. Please check back tomorrow for an improved summary.",relevance:"Initial calibration run"}]}))}}}var w=require("@aws-sdk/client-dynamodb"),i=require("@aws-sdk/lib-dynamodb"),B=new w.DynamoDBClient({}),K=i.DynamoDBDocumentClient.from(B,{marshallOptions:{removeUndefinedValues:!0}}),x=process.env.TABLE_NAME;async function U(e){let t=await K.send(new i.GetCommand({TableName:x,Key:{PK:`USER#${e}`,SK:"AGENT_MEMORY"}}));return t.Item?{userId:t.Item.userId,lastRunDate:t.Item.lastRunDate,summaryCount:t.Item.summaryCount||0,feedbackThemes:t.Item.feedbackThemes||[],preferenceHistory:t.Item.preferenceHistory||[]}:null}async function k(e){await K.send(new i.PutCommand({TableName:x,Item:{PK:`USER#${e.userId}`,SK:"AGENT_MEMORY",userId:e.userId,lastRunDate:e.lastRunDate,summaryCount:e.summaryCount,feedbackThemes:e.feedbackThemes.slice(-10),preferenceHistory:e.preferenceHistory.slice(-5)}}))}async function L(e){console.log("Daily Research Agent triggered:",JSON.stringify(e));let t=new Date().toISOString().split("T")[0];try{let s=await E();console.log(`Processing ${s.length} users`);for(let r of s)try{console.log(`Processing user: ${r.userId} with interests: ${r.interests.join(", ")}`);let n=await b(r.userId,5),d=n.filter(o=>o.comment).map(o=>`${o.rating==="up"?"\u{1F44D}":"\u{1F44E}"}: ${o.comment}`).join(`
`),c=await U(r.userId),u=await P(r.interests,r.preferencePrompt,d),l=crypto.randomUUID();await R({summaryId:l,userId:r.userId,date:t,sections:u.sections,createdAt:new Date().toISOString()}),await k({userId:r.userId,lastRunDate:t,summaryCount:(c?.summaryCount||0)+1,feedbackThemes:[...c?.feedbackThemes||[],...n.filter(o=>o.comment).map(o=>o.comment)],preferenceHistory:[...c?.preferenceHistory||[],r.preferencePrompt||""]}),console.log(`Successfully generated summary for user: ${r.userId}`)}catch(n){console.error(`Error processing user ${r.userId}:`,n)}console.log("Daily Research Agent completed successfully")}catch(s){throw console.error("Daily Research Agent failed:",s),s}}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map

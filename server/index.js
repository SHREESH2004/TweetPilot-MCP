import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { createPost } from "./mcp.tools.js";
import { fetchTableData } from "./connection.js";
import { myFetchTool } from "./connection.js";
import { addUser } from "./connection.js";
// Initialize MCP server
const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// Express app setup
const app = express();

// Simple addition tool
server.tool("addTwoNumbers", "Add two numbers", {
  a: z.number(),
  b: z.number()
}, async ({ a, b }) => {
  return {
    content: [{
      type: "text",
      text: `The sum of ${a} and ${b} is ${a + b}`
    }]
  };
});

// Tool to create a post (e.g., on Twitter)
server.tool("createPost", "Create a post on X (formerly Twitter)", {
  status: z.string()
}, async ({ status }) => {
  console.log("createPost tool called with:", status);
  return createPost(status);
});

server.tool("seeDatabaseRecords", "See SQL records", {
  tableName: z.string()
}, async ({ tableName }) => {
  console.log("Fetching table data for:", tableName);
  return await fetchTableData(tableName); // <- return directly, no wrapping
});

server.tool(
  "addDatabaseRecords",
  "Add a user to the SQL database (name, email)",
  {
    name: z.string(),
    email: z.string(),
  },
  async ({ name, email }) => {
    console.log("Adding user:", name, email);
    return await addUser(name, email); // This returns the formatted MCP `content` array
  }
);

// SSE transport setup
const transports = {};

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];

  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

// Start server
app.listen(3001, () => {
  console.log("Server is running on [http://localhost:3001]");
});

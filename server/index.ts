import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

import * as express from "express";
import * as cors from "cors";
import * as http from "http";
import * as path from 'path';
import * as dotenv from "dotenv";

import { ChatResolver } from "./resolvers/chat";

dotenv.config();

const schema = ChatResolver.getSchema();

const app = express();
app.use(cors({ origin: `http://localhost:${process.env.PORT}`, credentials: true }));

app.get('/', (req, res) => {
  res.send('Fresh Planet API');
})

app.get('/graphql', (req, res) => {
  res.sendFile(path.join(__dirname, './assets/graphiql-over-ws.html'));
})

const httpServer = http.createServer(app);

httpServer.listen({ port: process.env.PORT }, async () => {

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql"
  });

  const cleanServer = useServer(
    {
      schema,
      onConnect: async (ctx: any) => {
        console.log("Client connected for subscriptions");
      },
      onDisconnect(ctx: any, code: number, reason: string) {
        console.log("Client disconnected from subscriptions");
      }
    },
    wsServer
  );

  const apollo = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              cleanServer.dispose();
            }
          };
        }
      },
      (process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground({
          settings: {
            'general.betaUpdates': false,
            'editor.theme': 'dark',
            'editor.cursorShape': 'line',
            'editor.reuseHeaders': true,
            'tracing.hideTracingResponse': true,
            'queryPlan.hideQueryPlanResponse': true,
            'editor.fontSize': 14,
            'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
            'request.credentials': 'omit',
          }
        })
      )
    ]
  });
  
  await apollo.start();

  apollo.applyMiddleware({ app, cors: false });

  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${apollo.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${process.env.PORT}${apollo.graphqlPath}`);
});

import { PubSub, withFilter } from 'graphql-subscriptions';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { typeDefs } from "../entities/chat";

const pubsub = new PubSub();

type Post = {
  id: number;
  message: string;
  name: string;
};

const posts: Post[] = [];

const resolvers = {
  Query: {
    getPosts: async () => posts,
    getPost: async (id: number) => {
      let result = null;
      if (id > 0 && posts.length < id) {
        result = posts[id];
      }
      return result;
    }
  },
  Mutation: {
    createPost(parent: any, args: Post, context: any) {
      pubsub.publish('POST_CREATED', { postCreated: args });
      const post = { id: posts.length + 1, name: args.name, message: args.message };
      posts.push(post);
      return post;
    }
  },    
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
    }
  }
};

export class ChatResolver {
  constructor () {}

  static getSchema() {
    return makeExecutableSchema({ typeDefs, resolvers });
  }
}

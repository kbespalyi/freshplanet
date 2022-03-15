import { gql } from "apollo-server-express";

// Schema definition
export const typeDefs = gql`
  type Query {
    getPosts: [Post]
    getPost(id: Int!): Post
  }

  type Post {
    id: Int!
    message: String
    name: String
  }

  type Mutation {
    createPost(name: String, message: String): Post
  }

  type Subscription {
    postCreated: Post
  }
`;

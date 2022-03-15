# freshplanet

Introduction to Fresh Planet API

Visit localhost:4000/graphql

- Add new post:

mutation {
  createPost(name: "John", message: "first chat") {
    id
    name
    message
  }
}

- Try to get all posts:

query {
  getPosts {
    id
    name
    message
  }
}

- Try to subscribe to channel 'postCreated':

subscription PostFeed {
  postCreated {
    id
    name
    message
  }
}

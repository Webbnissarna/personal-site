This is a basic test site showcasing the use of ApolloClient to fetch and use GraphQL data in an React environment.

To test first run `npm run build` to get a build and then copy the contents of `build` to `../webserver/sites/test/static` and run `docker-compose -f docker-compose-dev.yml up` from the project root in order to serve the build.

The test db data is located in `./db_dumpbs`. Import it via the `mongo-express` service or any similar tool.
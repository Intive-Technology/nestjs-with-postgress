# NestJS with PostgreSQL
This is a comprehensive NestJS application that uses PostgreSQL as its database. The application has implemented several features including Authentication and Authorization, Zod validation, Passport, JWT, TypeORM with PostgreSQL, Swagger documentation, and both unit and end-to-end testing.

## Features
#### Authentication and Authorization
This application uses Passport and JWT for authentication and authorization. Passport is a popular middleware that can be used for authenticating requests. JWT, or JSON Web Tokens, are used to securely transmit information between parties as a JSON object.

#### Zod Validation
Zod is a library for creating, manipulating, and validating JavaScript schemas. It's used in this application to validate incoming data.

#### TypeORM with PostgreSQL
TypeORM is an ORM that can run in NodeJS and can be used with TypeScript and JavaScript. This application uses TypeORM for interacting with the PostgreSQL database.

#### Swagger Documentation
Swagger is used for API documentation. It helps design, build, document, and consume RESTful web services. The application has a Swagger UI that provides interactive documentation.

#### Unit and E2E Testing
The application has both unit tests and end-to-end tests. Unit tests are used to test individual components of the application, while end-to-end tests are used to test the application as a whole, from start to finish.

## Getting Started
To get started with this application, you need to have docker installed and running on your machine.

1. Clone the repository
2. Build images with command: `docker-compose build`
3. copy the `env.example` enviroment file to `.env` file.
4. Run the application with `docker-compose up -d`
5. Navigate to http://localhost:3000/docs to view the Swagger UI and interact with the API.

##### Testing
To run the tests, use the following commands:

* For unit tests: npm run test
* For end-to-end tests: npm run test:e2e

##### Contributing
Contributions are welcome. Please make sure to update tests as appropriate.

License
[MIT](https://choosealicense.com/licenses/mit/)
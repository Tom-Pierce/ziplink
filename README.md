# Ziplink API

This project serves as the backend RESTful API for Ziplink built using ExpressJS, a URL shortener and link management system. It provides endpoints for shortening URLs, managing ziplinks, tracking analytics and authenticating users.

## About Ziplink

Ziplink is a powerful tool for managing and sharing links. Whether you're looking to shorten URLs for social media posts, track the performance of marketing campaigns, or simply organize your bookmarks, Ziplink has you covered.

## Features

- **URL Shortening**: Provide a simple endpoint to shorten long URLs as well as the ability to create custom shortened URls.
- **Link Management**: Allow users to manage their shortened URLs, including creating, and deleting ziplinks.
- **Analytics Tracking**: Track metrics for each URL, such as clicks.

## Getting Started

To get started with the Ziplink API, follow these steps:

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Install Dependencies**: Navigate to the project directory and install dependencies using `npm install`.

3. **Database Setup**: Set up your MongoDB database and configure the connection details in the `.env` file.

4. **Configuration**: Create a `.env` file with the same variables as the `.env.example` file.

5. **Run the Server**: Start the server using `npm start`. The API will be accessible at the specified port (default is 3000).

## To-Do

Implement JWTs and refresh tokens instead of session management for authentication, this will provide faster response times as well as less database queries

## Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or inquiries, feel free to reach out to [tompierce4@gmail.com](mailto:tompierce4@gmail.com).

Thank you for using Ziplink API! 🚀

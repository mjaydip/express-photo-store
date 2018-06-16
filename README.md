# express-photo-store

This is a basic express js web application to store and browse images of your choice.
It gives you a building block to create a complex web application rendered on server and having AWS as asset storage service.
It has configuration to deploy in heroku from your git repo.

It is built with,
- Express js on top of Node js
- handlebars as template engine
- MongoDB as backend
- AWS to store user uploaded images

Steps to run the application on your local machine. (Assuming you have node js, npm and mongodb installed on your machine)

1. clone the application with git
      git clone https://github.com/mjaydip/express-photo-store.git
      
2. cd express-photo-store (For windows users)

3. npm i (to install all the dependencies using npm)

4. start your mongodb server on second terminal

5. npm run start (This will spin http server on port 3300)

6. open a web browser and browse http://localhost:3300

Above steps should give a running application with an extensible expressjs application.

Feel free to fork or submit PRs in case of any bugs identified. I will appreciate your interest.

Thanks!

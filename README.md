# flygo-nodejs

Step1: run `git clone git@github.com:nabeelCpp/flygo-nodejs.git` and rename .env-example file to .env
step2: run `npm install`
step3: download xampp for local database server, install it and run the control panel of xampp, then start the first two modules, ie apache and phpmyadmin.
step4: go to phpmyadmin (http://127.0.0.1/phpmyadmin) and then add new database named as flygo, or whatever name you want.
step5: copy same database name ie (flygo or any name you gave to db) , go to config/config.json and replace the details accordingly.
step6: run `npx sequelize-cli db:migrate` this will add all the required tables to database.
step7: run `npx sequelize-cli db:seed:all` this will create the admin user in database.
step8: npm run server
step9: import this postman collection to your postman and try running apis. `https://documenter.getpostman.com/view/19690167/2s9YBz2umt`

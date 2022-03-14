# Api Rest for the project positively

## Installation

1. Clone repository

```bash
git clone https://github.com/sourclab/ApiPositivamente.git
```

2. Updating libraries

```bash
npm install
```

3. Install mysql database (located in the bd folder of the src/bd repository)
4. Create .env file taking as example .env.example (USER_DB and PASS_DB)

| User          | Password |
| ------------- | :------: |
| positivamente | W!J9RPah |

5. Create database user with the data contained in the .env.example file.
6. The .env file has two variables EMAIL and PASSWORD corresponding to the data of a valid gmail email, since it is used to send emails through it.
   1. In the file src/mail.js you can find all the configuration, between lines 4 and 19 there is the sending configuration.
7. Start

```bash
npm run serve
```

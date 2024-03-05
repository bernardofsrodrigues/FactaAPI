# FactaAPI

## FGTS Query and Registration API

This project consists of an API for querying and registering information related to the Guarantee Fund for Length of Service (FGTS). The API includes endpoints for authentication, querying available balance for FGTS anticipation, simulating the net released amount of FGTS, as well as registering personal information and proposals.

## Technologies 

A Node.js application that uses the Axios library to make HTTP requests and the Express framework to build API endpoints. Here's an explanation of the key technologies used:

- **Node.js**: A JavaScript runtime environment used to build server-side applications.
- **Axios**: A Promise-based HTTP client for making HTTP requests to external APIs.
- **Express**: A web application framework for building APIs and web applications.


## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

1. Clone this repository:

    ```
    git clone https://github.com/bernardofsrodrigues/FactaAPI.git
    ```
    
2. Navigate to the project directory:

    cd FactaAPI

3. Install dependencies:

    ```
    npm install
    ```

## Usage

### Authentication and Token Generation

To authenticate and generate an access token:

```javascript
const username = 'your_username';
const password = 'your_password';

getToken(username, password)
    .then((token) => {
        console.log('Token obtained successfully: ', token);
    })
    .catch((error) => {
        console.log('Error obtaining token:', error);
    });

```
FGTS Balance Query
-----------------------

To query the available balance for FGTS anticipation:

`GET /consultarSaldoFGTS/:cpf`

Example usage:
```
http://localhost:3000/consultarSaldoFGTS/07302300666
```


FGTS Net Released Value Simulation
------------------------------------------

To simulate the net released value of FGTS:

`GET /simularValorLiquidoLiberado/:cpf`

Example usage:
```
http://localhost:3000/simularValorLiquidoLiberado/07302300666
```



Personal Information Registration
---------------------------

To register personal information:

`GET /cadastrar-dados-pessoais`

Example usage:
```
http://localhost:3000/cadastrar-dados-pessoais
```



Proposal Registration Execution
-----------------------------------

To execute the proposal registration:

`GET /realizar-cadastro-proposta`

Example usage:
```
http://localhost:3000/realizar-cadastro-proposta
```



Execution
--------

To start the server, execute:
```
node script.js
```



The server will be available at [http://localhost:3000](http://localhost:3000).




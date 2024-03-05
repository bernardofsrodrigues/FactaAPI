const axios = require('axios');
const express = require('express');
const { error } = require('server/router');
const app = express();
const port = 3000;


const usuario = 'user';
const senha = 'key';
let autorizacao;


let cpf = "07302300666";
let token_value;

// ------------------------> Autenticação: Geração token (GET) <------------------------
//gerando e obtendo token: 
async function gerarToken(usuario, senha) {
    const url = 'https://webservice-homol.facta.com.br/gera-token';

    const usersenha = `${usuario}:${senha}`;
    const base64Auth = Buffer.from(usersenha).toString('base64'); // usuario e senha no formato base64!

    const config = {
        headers: {
            'Authorization': `Basic ${base64Auth}`
        }
    };

    autorizacao = config;

    try {
        const response = await axios.get(url, config);
        console.log('Gerar token response: ',response.status);
        console.log("\n", response.data, "\n");
        return response.data;
    } catch (error) {
        console.error(`Erro ao GERAR o Token: ${error.message}`);
        throw new Error(`Erro ao GERAR o Token: ${error.message}`);
    }
}

async function obterToken(usuario, senha) {    
    try {
        const tokenResponse = await gerarToken(usuario, senha);
        console.log(tokenResponse.status);
        if (tokenResponse && tokenResponse.token) {
            return tokenResponse.token;
        } else {
            throw new Error('Token obtido está vazio ou ausente.');
        }
    } catch (error) {
        console.error(`Erro ao OBTER o Token: ${error.message}`);
        throw new Error(`Erro ao OBTER o Token: ${error.message}`);
    }
}
//printando token no console:
obterToken(usuario, senha).then((token) => {
        console.log('\nToken obtido com sucesso: ');
        token_value = `Bearer ${token}`;
        console.log('\n',token_value,"\n");
    })
    .catch((error) => {
        console.log('Erro ao obter token:', error);
    })


// ------------------------> Simulação: Consulta de saldo disponível para antecipação FGTS (GET) <------------------------
//rotas:
app.get('/consultarSaldoFGTS/:cpf', async (req, res) => {
    const cpf = req.params.cpf;

    try {
        const saldo = await consultarSaldoFGTS(cpf, autorizacao);
        res.json({ saldo })
    } catch (error) {
        res.status(500).json({error: 'Erro ao consultar saldo.'});
        throw new Error('Erro na requisição de consulta saldo FGTS: ${error.message}');
    }

})

//função:
async function consultarSaldoFGTS(cpf, autorizacao) {
    const url = `https://webservice-homol.facta.com.br/fgts/saldo?cpf=${cpf}`;

    try {
        const response = await axios.get(url, autorizacao);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao consultar saldo FGTS: ${error.message}');
    }
}



// ------------------------> Simulação: Valor líquido liberado FGTS (POST) <------------------------
//rota:
app.get('/simularValorLiquidoLiberado/:cpf', async (req, res) => {
    const cpf = req.params.cpf;

    try {
        const resultadoSimulacao = await simularValorLiquidoLiberado(cpf, autorizacao);
        res.json({ resultadoSimulacao });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao simular valor líquido liberado' });
    }
});


//função:
async function simularValorLiquidoLiberado(token_value) {
    const url = 'https://webservice-homol.facta.com.br/fgts/calculo';

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Authorization': token_value,
            'Content-Type': 'application/json'
        },
        data: {
            "cpf" : "", //07302300666 cpf de teste
            "taxa" : "",
            "tabela" : "",
            "parcelas" : []
        }
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(`\nErro ao simular valor líquido liberado: ${error.message}`);
    }
}


simularValorLiquidoLiberado(token_value)
    .then((result) => {
        console.log('Resultado do cálculo FGTS:', result);
    })
    .catch((error) =>{
        console.log('Erro ao simular: ', error);
    })




// ------------------------> 4) Cadastro: Simulação (POST) <------------------------
//rota:
app.get('/enviar-solicitacao', async (req, res) => {
    console.log('Recebendo solicitação...');
    
    try {
      const response = await enviarSolicitacao();
      res.status(response.status).json(response.data);
    } catch (error) {
      console.log('Error:', error.message);
      res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
  });

//função:
async function enviarSolicitacao() {
    const url = 'https://webservice-homol.facta.com.br/proposta/etapa1-simulador';
  
    const options = {
      headers: {
        'Authorization': token_value,
        'Content-Type': 'application/json',
      }
    };
  
    const data = {
      "produto": "",
      "tipo_operacao": "",
      "averbador": "",
      "convenio": "",
      "cpf": "",
      "data_nascimento": "",
      "login_certificado": "",
      "simulacao_fgts": "",
      "vendedor": ""
    };
  
    try {
      console.log('Enviando solicitação para:', url);
      const response = await axios.post(url, data, options);
      console.log('Status Code:', response.status);
      console.log('Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error:', error.message);
      throw new Error('Erro ao enviar solicitação');
    }
  }




// ------------------------> 5) Cadastro: Dados pessoais (POST) <------------------------
//rota:
app.get('/cadastrar-dados-pessoais', async (req, res) => {
    console.log('Recebendo solicitação para cadastrar dados pessoais...');
  
    const dados = req.body;
  
    try {
      const result = await cadastrarDadosPessoais(dados);
  
      console.log('Status Code:', result.status);
      console.log('Response:', result.data);
      res.status(result.status).json(result.data);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
  });

//função:
let id = ""; //retornar do cadastro-simulacao.js
async function cadastrarDadosPessoais(dados, id) {
    const url = 'https://webservice-homol.facta.com.br/proposta/etapa2-dados-pessoais';
    const options = {
      headers: {
        'Authorization': token_value,
        'Content-Type': 'application/json',
      }
    };
  
    const data = {
      "id_simulador": id,
      "cpf": "",
      "nome": "",
      "sexo": "",
      "estado_civil": "",
      "data_nascimento": "",
      "rg": "",
      "estado_rg": "",
      "orgao_emissor": "",
      "data_expedicao": "",
      "estado_natural": "",
      "cidade_natural": "",
      "nacionalidade": "",
      "pais_origem": "",
      "celular": "",
      "renda": "",
      "cep": "",
      "endereco": "",
      "numero": "",
      "complemento": "",
      "bairro": "",
      "cidade": "",
      "estado": "",
      "nome_mae": "",
      "nome_pai": "",
      "valor_patrimonio": "",
      "cliente_iletrado_impossibilitado": "",
      "banco": "",
      "agencia": "",
      "conta": "",
      "tipo_conta": ""
    };
  
    try {
      const response = await axios.post(url, data, options);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw new Error(`Erro ao cadastrar dados pessoais: ${error.message}`);
    }
  }



// ------------------------> 6) Cadastro: Proposta cadastro (POST) <------------------------
//rota:
app.get('/realizar-cadastro-proposta', (req, res) => {
    const { codigo_cliente, id_simulador } = req.body;
  
    realizarCadastroProposta(codigo_cliente, id_simulador, token);
  
    res.json({ message: 'Requisição de cadastro de proposta enviada com sucesso' });
  });


//função:
async function realizarCadastroProposta(codigoCliente, idSimulador, token) {
    const url = 'https://webservice-homol.facta.com.br/proposta/etapa3-proposta-cadastro';
  
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  
    const data = {
      codigo_cliente: codigoCliente,
      id_simulador: idSimulador,
    };
  
    try {
      const response = await axios.post(url, data, config);
      console.log(response.status);
      console.log(response.data);
    } catch (error) {
      console.error(error.message);
    }
  }





// ------------------------> 7) Formalização: envio de link para assinatura (POST) <------------------------
//aqui eu nem olhei
async function enviarLinkAssinatura(codigoAf, tipoEnvio, token) {
    const url = 'https://webservice-homol.facta.com.br/proposta/envio-link';
  
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  
    const data = new URLSearchParams();
    data.append('codigo_af', codigoAf);
    data.append('tipo_envio', tipoEnvio);
  
    try {
      const response = await axios.post(url, data, config);
      console.log(response.status);
      console.log(response.data);
    } catch (error) {
      console.error(error.message);
    }
  }
  
  // Exemplo de uso
  const codigoAf = 'coloqueAquiOCodigoAf'; // Substitua pelo código retornado na etapa 6
  const tipoEnvio = 'whatsapp'; // ou 'sms' conforme necessário
  const token = 'coloqueAquiSeuToken'; // Substitua pelo seu token real
  
  enviarLinkAssinatura(codigoAf, tipoEnvio, token);




//printa no console o link que o servidor ta rotando da porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Servidor rodando em http://localhost:${port}/consultarSaldoFGTS/${cpf}`, "\t--> Incluir cpf");
    console.log(`Servidor rodando em http://localhost:${port}/simularValorLiquidoLiberado/${cpf}`, "\t--> Incluir cpf");
    console.log(`Servidor rodando em http://localhost:${port}/enviar-solicitacao`);
    console.log(`Server running at http://localhost:${port}/enviar-dados-pessoais`);
    console.log(`Server running at http://localhost:${port}/cadastrar-dados-pessoais`);
    console.log(`Servidor rodando na porta http://localhost:${port}/realizar-cadastro-proposta`);

})

const express = require('express');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configuração do banco de dados
const config = {
    user: 'hadmin',
    password: '877887@Hf',
    server: 'server-um.database.windows.net',
    database: 'fatec-projeto',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};
// Verifica se logDeAcoes é undefined e o inicializa como um array vazio se for
if (typeof logDeAcoes === 'undefined') {
    logDeAcoes = [];
}
// Função para verificar se a tabela LogAcoes existe
const verificarTabelaLogAcoes = async () => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const result = await request.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LogAcoes'`);
        return result.recordset.length > 0;
    } catch (error) {
        console.error('Erro ao verificar se a tabela LogAcoes existe:', error);
        return false;
    }
};

// Função para criar a tabela LogAcoes se ela não existir
const criarTabelaLogAcoes = async () => {
    const tabelaExiste = await verificarTabelaLogAcoes();
    if (!tabelaExiste) {
        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            await request.query(`
                CREATE TABLE LogAcoes (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Mensagem NVARCHAR(255)
                )
            `);
            console.log('Tabela LogAcoes criada com sucesso.');
        } catch (error) {
            console.error('Erro ao criar tabela LogAcoes:', error);
        }
    } else {
        console.log('Tabela LogAcoes já existe.');
    }
};

// Chamar a função para criar a tabela LogAcoes ao iniciar o servidor
criarTabelaLogAcoes();


// Chamar a função para criar a tabela LogAcoes ao iniciar o servidor
criarTabelaLogAcoes();

app.use(express.json());

// Restante do código...

// Configuração da sessão
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Altere para true se estiver usando HTTPS
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
// Servir arquivos estáticos das pastas jogo, dashboard e login
app.use('/jogo', express.static(path.join(__dirname, 'jogo')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Rota para registrar usuário
app.post('/register', async (req, res) => {
    const { usuario, senha } = req.body;
    try {
        const pool = await sql.connect(config);
        const hashedPassword = await bcrypt.hash(senha, 10);
        const request = pool.request();
        await request.input('usuario', sql.NVarChar, usuario)
                      .input('senha', sql.NVarChar, hashedPassword)
                      .query('INSERT INTO Usuarios (Usuario, Senha) VALUES (@usuario, @senha)');
        res.status(201).send('Usuário registrado com sucesso.');
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).send('Erro ao registrar usuário.');
    }
});

// Rota para autenticar usuário
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const result = await request.input('usuario', sql.NVarChar, usuario)
                                     .query('SELECT * FROM Usuarios WHERE Usuario = @usuario');
        const user = result.recordset[0];
        if (!user || !(await bcrypt.compare(senha, user.Senha))) {
            return res.status(400).send('Usuário ou senha incorretos.');
        }
        req.session.user = user.Usuario;
        res.status(200).send('Login bem-sucedido.');
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send('Erro ao fazer login.');
    }
});

// Rota para atualizar a vida dos personagens e o log de ações na nova tabela LogAcoes
app.post('/atualizarJogo', async (req, res) => {
    const { vidaKong, vidaGodzilla, logDeAcoes, turnoMessage } = req.body; // Adicionando 'turnoMessage' à requisição
    let transaction;
    try {
        const pool = await sql.connect(config);
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Atualizar a vida dos personagens na tabela Jogo
        const request = pool.request();
        await request.query(`
            UPDATE Jogo SET Vida = ${vidaKong} WHERE Nome = 'kong';
            UPDATE Jogo SET Vida = ${vidaGodzilla} WHERE Nome = 'godzilla';
        `);

        // Inserir as mensagens de log na tabela LogAcoes
        for (const mensagem of logDeAcoes) {
            await request.query(`INSERT INTO LogAcoes (Mensagem) VALUES ('${mensagem}')`);
        }

        // Inserir a mensagem de turno na tabela LogAcoes
        await request.query(`INSERT INTO LogAcoes (Mensagem) VALUES ('${turnoMessage}')`);

        await transaction.commit();
        res.status(200).send('Dados do jogo e log de ações atualizados com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar dados do jogo e log de ações:', error);
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).send('Erro ao atualizar dados do jogo e log de ações.');
    }
});


// Rota para buscar os registros de log de ações
app.get('/logAcoes', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const result = await request.query("SELECT * FROM LogAcoes ORDER BY Data DESC");
        console.log(result.recordset); // Verificar o formato dos dados de log
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar registros de log de ações:', error);
        res.status(500).json({ error: 'Erro ao buscar registros de log de ações.' });
    }
});



// Nova rota para buscar dados dos personagens
app.get('/characters', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const result = await request.query("SELECT * FROM Jogo");
        const data = result.recordset.reduce((acc, curr) => {
            acc[curr.Nome.toLowerCase()] = {
                Vida: curr.Vida,
                // LogAcoes removido daqui
            };
            return acc;
        }, {});
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar dados do jogo:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do jogo.' });
    }
});



// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Rota para servir o arquivo HTML do jogo
app.get('/jogo', (req, res) => {
    res.sendFile(path.join(__dirname, 'jogo', 'jogo.html'));
});

// Rota para servir o arquivo HTML do dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'dashboard.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
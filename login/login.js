const ComponenteLogin = {
    template: `
        <div class="componente">
            <h1>Login</h1>
            <form @submit.prevent="login">
                <input type="text" v-model="usuario" placeholder="Usuário" required />
                <input type="password" v-model="senha" placeholder="Senha" required />
                <button type="submit">Entrar</button>
            </form>
            <p v-if="erro" class="erro">{{ erro }}</p>
        </div>
    `,
    data() {
        return {
            usuario: '',
            senha: '',
            erro: ''
        };
    },
    methods: {
        async login() {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: this.usuario, senha: this.senha })
                });
                if (response.ok) {
                    window.location.href = '/jogo'; // Redireciona para o jogo após login bem-sucedido
                } else {
                    const message = await response.text();
                    this.erro = message;
                }
            } catch (error) {
                this.erro = 'Erro ao fazer login.';
            }
        }
    }
};

const ComponenteSignIn = {
    template: `
        <div class="componente">
            <h1>Cadastre-se</h1>
            <form @submit.prevent="register">
                <input type="text" v-model="usuario" placeholder="Usuário" required />
                <input type="password" v-model="senha" placeholder="Senha" required />
                <input type="password" v-model="confirmarSenha" placeholder="Confirme a senha" required />
                <button type="submit">Cadastrar</button>
            </form>
            <p v-if="erro" class="erro">{{ erro }}</p>
        </div>
    `,
    data() {
        return {
            usuario: '',
            senha: '',
            confirmarSenha: '',
            erro: ''
        };
    },
    methods: {
        async register() {
            if (this.senha !== this.confirmarSenha) {
                this.erro = 'As senhas não coincidem.';
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: this.usuario, senha: this.senha })
                });
                if (response.ok) {
                    window.location.href = '/jogo'; // Redireciona para o jogo após registro bem-sucedido
                } else {
                    const message = await response.text();
                    this.erro = message;
                }
            } catch (error) {
                this.erro = 'Erro ao registrar usuário.';
            }
        }
    }
};

const { createApp } = Vue;

createApp({
    data() {
        return {
            componenteAtual: "ComponenteLogin",
            textoBotao: "Não tenho cadastro"
        }
    },
    methods: {
        alterarComponentes() {
            if (this.componenteAtual === "ComponenteLogin") {
                this.componenteAtual = "ComponenteSignIn";
                this.textoBotao = "Já possuo cadastro";
            } else {
                this.componenteAtual = "ComponenteLogin";
                this.textoBotao = "Não tenho cadastro";
            }
        }
    },
    components: {
        ComponenteLogin,
        ComponenteSignIn
    }
}).mount("#app")

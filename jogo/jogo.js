const { createApp } = Vue;

createApp({
    data() {
        return {
            kong: { vida: 100, pocoes: 3, defendendo: false },
            godzilla: { vida: 100, pocoes: 4, defendendo: false },
            turno: 'kong', // Inicializa o jogo começando com o turno do KONG
            logDeAcoes: [] // Lista para armazenar as mensagens do log de ações
        };
    },
    methods: {
        atacar(isKong) {
            if (this.turno !== (isKong ? 'kong' : 'godzilla')) {
                this.adicionarAoLog("Não é o turno de " + (isKong ? "KONG" : "GODZILLA"));
                return;
            }

            let dano = Math.floor(Math.random() * 20) + 1;
            let alvo = isKong ? this.godzilla : this.kong;
            if (alvo.defendendo) {
                dano /= 2;
                alvo.defendendo = false;
            }
            alvo.vida = Math.max(alvo.vida - dano, 0);
            this.adicionarAoLog(`${isKong ? 'KONG' : 'GODZILLA'} atacou com ${dano} de dano.`);

            if (alvo.vida <= 0) {
                this.adicionarAoLog(`${isKong ? 'GODZILLA' : 'KONG'} foi derrotado!`);
            } else {
                this.turno = isKong ? 'godzilla' : 'kong';
                if (this.turno === 'godzilla') {
                    setTimeout(() => {
                        this.acaoGodzilla();
                    }, 2000); // Delay de 2 segundos antes do GODZILLA agir
                }
            }
        },
        acaoGodzilla() {
            if (this.turno === 'godzilla') {
                const acoes = ['atacar', 'atacar', 'atacar', 'atacar', 'defender', 'usarPocao'];
                const acaoAleatoria = acoes[Math.floor(Math.random() * acoes.length)];
                this[acaoAleatoria](false);
                this.turno = 'kong'; // Troca o turno para o KONG após a ação do GODZILLA
            }
        },
        defender(isKong) {
            if (this.turno !== (isKong ? 'kong' : 'godzilla')) {
                this.adicionarAoLog("Não é o turno de " + (isKong ? "KONG" : "GODZILLA"));
                return;
            }

            const personagem = isKong ? this.kong : this.godzilla;
            personagem.defendendo = true;
            this.adicionarAoLog(`${isKong ? 'KONG' : 'GODZILLA'} está defendendo.`);
            this.turno = isKong ? 'godzilla' : 'kong';
            if (this.turno === 'godzilla') {
                setTimeout(() => {
                    this.acaoGodzilla();
                }, 2000);
            }
        },
        usarPocao(isKong) {
            if (this.turno !== (isKong ? 'kong' : 'godzilla')) {
                this.adicionarAoLog("Não é o turno de " + (isKong ? "KONG" : "GODZILLA"));
                return;
            }

            const personagem = isKong ? this.kong : this.godzilla;
            if (personagem.pocoes > 0) {
                const recuperacao = 30;
                personagem.vida = Math.min(personagem.vida + recuperacao, 100);
                personagem.pocoes--;
                this.adicionarAoLog(`${isKong ? 'KONG' : 'GODZILLA'} usou uma poção e agora tem ${personagem.vida} de vida.`);
                this.turno = isKong ? 'godzilla' : 'kong';
                if (this.turno === 'godzilla') {
                    setTimeout(() => {
                        this.acaoGodzilla();
                    }, 2000);
                }
            } else {
                this.adicionarAoLog(`Não há mais poções para o ${isKong ? 'KONG' : 'GODZILLA'}.`);
            }
        },
        correr(isKong) {
            if (this.turno !== (isKong ? 'kong' : 'godzilla')) {
                this.adicionarAoLog("Não é o turno de " + (isKong ? "KONG" : "GODZILLA"));
                return;
            }

            const chanceDeFuga = 0.1;
            if (Math.random() < chanceDeFuga) {
                this.adicionarAoLog(`${isKong ? 'KONG conseguiu fugir. Fim de jogo!' : 'GODZILLA fugiu. KONG venceu!'}`);
                this.turno = ''; // Encerra a sequência de turnos
            } else {
                this.adicionarAoLog(`${isKong ? 'KONG tentou fugir e falhou.' : 'GODZILLA tentou fugir e falhou.'}`);
                this.turno = isKong ? 'godzilla' : 'kong';
                if (this.turno === 'godzilla') {
                    setTimeout(() => {
                        this.acaoGodzilla();
                    }, 2000);
                }
            }
        },
        adicionarAoLog(mensagem) {
            this.logDeAcoes.push(mensagem);
        }
    }
}).mount("#app");

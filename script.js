//  CONFIGURAÇÃO E INTEGRAÇÃO COM FIREBASE (APP + AUTH + FIRESTORE)

// Importando módulos do Firebase (versão modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


//  DADOS DO SEU PROJETO FIREBASE
//  CONFIRA NO CONSOLE DO FIREBASE SE O storageBucket ESTÁ IGUAL
const firebaseConfig = {
    apiKey: "AIzaSyBRUACI-ZP4CbRa7P6BizBFdlQkc2jZqPM",
    authDomain: "quiz-bigdata.firebaseapp.com",
    projectId: "quiz-bigdata",
    storageBucket: "quiz-bigdata.appspot.com",
    messagingSenderId: "171248679759",
    appId: "1:171248679759:web:d33affd571d3b11651e33a"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Serviços usados: Autenticação e Firestore
const auth = getAuth(app);
const db = getFirestore(app);


// --- BOTÃO DE LOGOUT (SÓ FUNCIONA SE O BOTÃO EXISTIR NA PÁGINA) ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth)
        .then(() => {
            alert("Você saiu da conta!");
            window.location.href = "login.html"; // redireciona pra página de login
        })
        .catch((error) => {
            console.error("Erro ao sair:", error);
        });
    });
}


// CONTROLE SIMPLES DE ROTAS (login.html / index.html)

// Descobre o arquivo atual (ex: "index.html", "login.html")
const paginaAtual = window.location.pathname.split("/").pop() || "quiz.html";

// Observa mudanças de autenticação para redirecionar
onAuthStateChanged(auth, (user) => {
    if (paginaAtual === "quiz.html") {
        // Se estiver no quiz e não estiver logado, manda para login
        if (!user) {
            window.location.href = "login.html";
        }
    } else if (paginaAtual === "login.html") {
        // Se já estiver logado e está na página de login, manda para o quiz
        if (user) {
            window.location.href = "quiz.html";
        }
    }
});


//  FUNÇÕES DE AUTENTICAÇÃO (CADASTRO / LOGIN)
//  USADAS NA PÁGINA login.html

// Cadastro de novo usuário
async function cadastrarUsuario() {
    const nome = document.getElementById("cad-nome")?.value;
    const email = document.getElementById("cad-email")?.value;
    const senha = document.getElementById("cad-senha")?.value;
    const mensagemAuth = document.getElementById("mensagem-auth");

    if (!nome || !email || !senha) {
        if (mensagemAuth) {
            mensagemAuth.style.color = "#ffb3b3";
            mensagemAuth.textContent = "Preencha nome, e-mail e senha para cadastrar.";
        }
        return;
    }

    try {
        // Cria usuário no Firebase Authentication
        const cred = await createUserWithEmailAndPassword(auth, email, senha);

        // Atualiza o perfil com o nome
        await updateProfile(cred.user, {
            displayName: nome
        });

        // Cria/atualiza documento do usuário no Firestore
        await setDoc(doc(db, "usuarios", cred.user.uid), {
            nome: nome,
            email: email,
            criadoEm: serverTimestamp()
        }, { merge: true });

        if (mensagemAuth) {
            mensagemAuth.style.color = "#2ecc71";
            mensagemAuth.textContent = "Cadastro realizado com sucesso! Redirecionando...";
        }

        // Redireciona para o quiz
        setTimeout(() => {
            window.location.href = "quiz.html";
        }, 1500);

    } catch (erro) {
        console.error(erro);
        if (mensagemAuth) {
            mensagemAuth.style.color = "#ffb3b3";
            mensagemAuth.textContent = "Erro ao cadastrar: " + (erro.message || erro.code);
        }
    }
}

// Login de usuário existente
async function logarUsuario() {
    const email = document.getElementById("login-email")?.value;
    const senha = document.getElementById("login-senha")?.value;
    const mensagemAuth = document.getElementById("mensagem-auth");

    if (!email || !senha) {
        if (mensagemAuth) {
            mensagemAuth.style.color = "#ffb3b3";
            mensagemAuth.textContent = "Preencha e-mail e senha para entrar.";
        }
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, senha);

        if (mensagemAuth) {
            mensagemAuth.style.color = "#2ecc71";
            mensagemAuth.textContent = "Login realizado! Redirecionando...";
        }

        setTimeout(() => {
            window.location.href = "quiz.html";
        }, 1000);

    } catch (erro) {
        console.error(erro);
        if (mensagemAuth) {
            mensagemAuth.style.color = "#ffb3b3";
            mensagemAuth.textContent = "Erro ao fazer login: " + (erro.message || erro.code);
        }
    }
}

// Adiciona os eventos somente se estivermos na página de login
if (paginaAtual === "login.html") {
    const btnCadastrar = document.getElementById("btn-cadastrar");
    const btnLogin = document.getElementById("btn-login");

    if (btnCadastrar) btnCadastrar.addEventListener("click", cadastrarUsuario);
    if (btnLogin) btnLogin.addEventListener("click", logarUsuario);
}


//  ARRAY DE PERGUNTAS DO QUIZ (SEU CONTEÚDO ORIGINAL)

const perguntas = [ 
{
pergunta: "O que significa 'Criar com IA'?",
opcoes: ["Usar algoritmos para automatizar tarefas criativas", "Fazer cálculos matemáticos", "Editar vídeos manualmente", "Programar sem internet"],
resposta: "Usar algoritmos para automatizar tarefas criativas"
},

{
pergunta: "Qual ferramenta de IA é famosa por gerar textos e responder perguntas?",
opcoes: ["ChatGPT", "Photoshop", "Illustrator", "Zoom"],
resposta: "ChatGPT"
},

{

    pergunta: "O que é 'prompt' no contexto da IA?",
opcoes: ["Um comando ou instrução dada à IA", "Um erro do sistema", "Um tipo de arquivo", "Uma ferramenta de edição"],
resposta: "Um comando ou instrução dada à IA"
},

{
pergunta: "Em criação com IA, o que significa 'geração de imagem'? ",
opcoes: ["Produzir imagens novas a partir de descrições textuais", "Copiar imagens existentes", "Editar vídeos", "Converter texto em planilhas"],
resposta: "Produzir imagens novas a partir de descrições textuais"
},


{
pergunta: "Qual dessas IAs é usada para criar músicas e sons originais?",
opcoes: ["Suno AI", "ChatGPT", "Excel", "Notepad"],
resposta: "Suno AI"
},

{
pergunta: "O que o termo 'deepfake' representa?",
opcoes: ["Vídeo manipulado por IA para parecer real", "Um vírus de computador", "Um código-fonte aberto", "Um tipo de criptomoeda"],
resposta: "Vídeo manipulado por IA para parecer real"
},

{
pergunta: "Qual é um dos riscos de criar conteúdo com IA?",
opcoes: ["Geração de informações falsas ou plágio", "Acelerar o aprendizado", "Melhorar a criatividade", "Aumentar a produtividade"],
resposta: "Geração de informações falsas ou plágio"
},

{ 
pergunta: "Qual é o principal objetivo de um Laboratório de Animação?", 
opcoes: ["Produzir vídeos caseiros", "Desenvolver projetos de animação e modelagem digital", "Montar computadores", "Criar planilhas no Excel"], 
resposta: "Desenvolver projetos de animação e modelagem digital"
},

{ 
pergunta: "Qual software é amplamente usado para modelagem e animação 3D?", 
opcoes: ["Photoshop", "Blender", "Word", "Audacity"], 
resposta: "Blender"
},

{ 
pergunta: "Na criação de personagens, o que define o 'conceito visual'?", 
opcoes: ["As cores e formas que representam a personalidade do personagem", "O código fonte do personagem", "A velocidade da animação", "O tipo de renderização"], 
resposta: "As cores e formas que representam a personalidade do personagem"
},

{ 
pergunta: "Em informática básica, o que é um sistema operacional?", 
opcoes: ["Um antivírus", "Um programa que gerencia o hardware e os softwares do computador", "Um jogo", "Um aplicativo de música"], 
resposta: "Um programa que gerencia o hardware e os softwares do computador"
},

{ 
pergunta: "Qual destes é um exemplo de sistema operacional?", 
opcoes: ["Google Chrome", "Windows 11", "Blender", "PowerPoint"], 
resposta: "Windows 11"
},

{ 
pergunta: "O que significa a sigla IA?", 
opcoes: ["Interface Analógica", "Inteligência Artificial", "Imagem Automática", "Informação Aleatória"], 
resposta: "Inteligência Artificial"
},

{ 
pergunta: "No Blender, qual modo é usado para esculpir formas orgânicas?", 
opcoes: ["Edit Mode", "Sculpt Mode", "Object Mode", "Render Mode"], 
resposta: "Sculpt Mode"
},

{ 
pergunta: "Qual ferramenta da IA pode gerar imagens a partir de texto?", 
opcoes: ["ChatGPT", "DALL·E", "Excel", "Google Docs"], 
resposta: "DALL·E"
},

{ 
pergunta: "O que é 'renderização' em animação 3D?", 
opcoes: ["Salvar o arquivo", "Converter o modelo 3D em uma imagem ou vídeo final", "Modelar um personagem", "Adicionar texturas"], 
resposta: "Converter o modelo 3D em uma imagem ou vídeo final"
},

{ 
pergunta: "Na criação de personagens, o que é um 'storyboard'?", 
opcoes: ["Um tipo de textura", "Um roteiro visual com quadros que mostram as cenas da animação", "Um modelo 3D", "Um efeito de renderização"], 
resposta: "Um roteiro visual com quadros que mostram as cenas da animação"
},

{ 
pergunta: "Qual é a principal função do teclado em informática básica?", 
opcoes: ["Processar imagens", "Inserir dados e comandos no computador", "Exibir vídeos", "Aumentar o volume do som"], 
resposta: "Inserir dados e comandos no computador"
},

{ 
pergunta: "O que é textura em modelagem 3D?", 
opcoes: ["Um tipo de código de animação", "Uma imagem aplicada à superfície de um modelo para dar aparência realista", "Um modelo em wireframe", "Um script de iluminação"], 
resposta: "Uma imagem aplicada à superfície de um modelo para dar aparência realista"
},

{ 
pergunta: "Qual vantagem de criar personagens com IA?", 
opcoes: ["Reduz o tempo de criação e amplia as possibilidades criativas", "Aumenta o tamanho dos arquivos", "Remove o controle do artista", "Cria apenas modelos 2D simples"], 
resposta: "Reduz o tempo de criação e amplia as possibilidades criativas"
},

{ 
pergunta: "No Blender, qual atalho padrão ativa o modo de edição (Edit Mode)?", 
opcoes: ["Tab", "Ctrl + E", "Alt + M", "Shift + R"], 
resposta: "Tab"
},

{ 
pergunta: "O que é BIG DATA?", 
opcoes: ["Pequeno banco de dados", "Grande volume de dados", "Não existem dados", "Um tipo de software"], 
resposta: "Grande volume de dados"
}, 
{
pergunta: "Qual das alternativas NÃO faz parte dos 5 Vs do Big Data?",
opcoes: ["Volume", "Variedade", "Veracidade", "Virtualização"],
resposta: "Virtualização"
},
{
pergunta: "Qual linguagem de programação é mais popular para análise de dados e IA?",
opcoes: ["Java", "C#", "Python", "PHP"],
resposta: "Python"
},
{
pergunta: "Sou rápido, invisível e viajo pelo ar. Conecto pessoas, mas ninguém me vê. O que sou?",
opcoes: ["Bluetooth", "Wi-Fi", "Cabo USB", "Satélite"],
resposta: "Wi-Fi"
},
{
pergunta: "Qual o nome dado ao 'cérebro' de um sistema de Inteligência Artificial?",
opcoes: ["Memória RAM", "Processador", "Rede Neural", "Placa-mãe"],
resposta: "Rede Neural"
},
{
pergunta: "Qual desses protocolos é usado para envio de e-mails?",
opcoes: ["HTTP", "FTP", "SMTP", "TCP"],
resposta: "SMTP"
},
{
pergunta: "Qual empresa criou o sistema operacional Android?",
opcoes: ["Apple", "Microsoft", "Google", "Android Inc."],
resposta: "Android Inc."
},
{
pergunta: "Qual destes não é um banco de dados NoSQL?",
opcoes: ["MongoDB", "Cassandra", "PostgreSQL", "Redis"],
resposta: "PostgreSQL"
}
];


//  VARIÁVEIS GLOBAIS DO QUIZ + ÁUDIOS + HISTÓRICO

let indiceAtual = 0;       // Índice da pergunta atual
let acertos = 0;           // Contador de acertos
let erros = 0;             // Contador de erros
let nomeUsuario = "";      // Nome do usuário
let respostasDadas = [];   // Controle de perguntas já respondidas

// Novo: histórico detalhado das respostas
// Cada item será {indicePergunta, pergunta, respostaUsuario, respostaCorreta, correta}
let historicoRespostas = [];

// Referências de áudio (na página index.html; na página de login serão null, por isso vamos checar antes de tocar)
const somAcertou = document.getElementById('som-acertou');
const somErrou = document.getElementById('som-errou');
const somSucesso = document.getElementById('som-sucesso');
const somDerrota = document.getElementById('som-derrota');


//  FUNÇÕES AUXILIARES DO QUIZ

// Toca um som por uma duração específica (segundos)
function tocarSom(elementoAudio, duracao = 2) {
    if (!elementoAudio) return; // Se não tiver áudio na página, ignora

    elementoAudio.currentTime = 0;
    elementoAudio.play();

    setTimeout(() => {
        elementoAudio.pause();
    }, duracao * 1000);
}

// Atualiza a barra de progresso
function atualizarBarraProgresso() {
    const porcentagem = (indiceAtual / perguntas.length) * 100;
    const barra = document.getElementById("barra-progresso");
    if (barra) barra.style.width = `${porcentagem}%`;
}


//  FLUXO PRINCIPAL DO QUIZ

function iniciarQuiz() {
    const nomeInput = document.getElementById("entrada-nome");
    const errorMessage = document.getElementById("mensagem-erro");

    const user = auth.currentUser;

    // Se o usuário estiver logado e tiver displayName, usamos esse nome
    if (user && user.displayName) {
        nomeUsuario = user.displayName;
    } else {
        nomeUsuario = nomeInput ? nomeInput.value : "";
    }

    if (!nomeUsuario || !nomeUsuario.trim()) {
        if (errorMessage) {
            errorMessage.textContent = "Por favor, digite um nome para começar!";
            errorMessage.classList.remove("oculto");
        }
        if (nomeInput) nomeInput.classList.add("entrada-erro");
        return;
    }

    // Reseta variáveis
    acertos = 0;
    erros = 0;
    indiceAtual = 0;
    respostasDadas = new Array(perguntas.length).fill(false);
    historicoRespostas = [];

    const containerInicio = document.getElementById("container-inicio");
    const resultado = document.getElementById("resultado");
    const quiz = document.getElementById("quiz");
    const quizPrincipal = document.getElementById("quiz-principal");

    if (containerInicio) containerInicio.classList.add("oculto");
    if (resultado) resultado.classList.add("oculto");
    if (quiz) quiz.classList.remove("oculto");
    if (quizPrincipal) quizPrincipal.classList.remove("oculto");

    // Reseta barra de progresso
    const barra = document.getElementById("barra-progresso");
    if (barra) barra.style.width = "0%";

    carregarPergunta();
}

// Carrega a pergunta atual na tela
function carregarPergunta() {
    atualizarBarraProgresso();

    const botaoVoltar = document.getElementById('botao-voltar');
    const proximoBtn = document.getElementById('botao-proximo');
    const feedbackMessage = document.getElementById('mensagem-feedback');
    const perguntaEl = document.getElementById("pergunta");
    const opcoesContainer = document.getElementById("opcoes");

    if (!perguntaEl || !opcoesContainer || !proximoBtn) return;

    // Mostra ou esconde o botão voltar
    if (botaoVoltar) {
        botaoVoltar.style.display = indiceAtual === 0 ? 'none' : 'inline-block';
    }

    // Configura botão "Verificar"
    proximoBtn.textContent = 'Verificar';
    proximoBtn.onclick = verificarResposta;

    // Limpa feedback
    if (feedbackMessage) {
        feedbackMessage.innerHTML = "";
        feedbackMessage.className = '';
    }

    const perguntaAtual = perguntas[indiceAtual];
    perguntaEl.textContent = perguntaAtual.pergunta;

    opcoesContainer.innerHTML = "";
    opcoesContainer.classList.remove("opcoes-desabilitadas");

    // Cria botões de opção
    perguntaAtual.opcoes.forEach(opcaoTexto => {
        const botao = document.createElement("button");
        botao.textContent = opcaoTexto;
        botao.classList.add("opcao");

        botao.onclick = () => {
            const todosBotoes = document.querySelectorAll(".opcao");
            todosBotoes.forEach(b => b.classList.remove("selecionada"));
            botao.classList.add("selecionada");
        };

        opcoesContainer.appendChild(botao);
    });
}

// Verifica a resposta selecionada
function verificarResposta() {
    const respostaSelecionadaEl = document.querySelector(".opcao.selecionada");
    const opcoesContainer = document.getElementById("opcoes");
    const feedbackMessage = document.getElementById('mensagem-feedback');

    if (!respostaSelecionadaEl) {
        alert("Por favor, selecione uma resposta.");
        return;
    }

    if (opcoesContainer) {
        opcoesContainer.classList.add("opcoes-desabilitadas");
    }

    const respostaDoUsuario = respostaSelecionadaEl.textContent;
    const perguntaAtual = perguntas[indiceAtual];

    if (!feedbackMessage) return;

    if (!respostasDadas[indiceAtual]) {
        const correta = (respostaDoUsuario === perguntaAtual.resposta);

        if (correta) {
            acertos++;
            feedbackMessage.textContent = "Resposta Correta!";
            feedbackMessage.className = 'feedback-correto';
            respostaSelecionadaEl.style.backgroundColor = "#2ecc71";
            tocarSom(somAcertou);
        } else {
            erros++;
            feedbackMessage.innerHTML = `Incorreto. A resposta certa é: <strong>${perguntaAtual.resposta}</strong>`;
            feedbackMessage.className = 'feedback-incorreto';
            respostaSelecionadaEl.style.backgroundColor = "#e74c3c";
            tocarSom(somErrou);

            const opcoes = document.querySelectorAll(".opcao");
            opcoes.forEach(opcao => {
                if (opcao.textContent === perguntaAtual.resposta) {
                    opcao.style.backgroundColor = "#2ecc71";
                }
            });
        }

        // Salva essa resposta no histórico
        historicoRespostas.push({
            indicePergunta: indiceAtual,
            pergunta: perguntaAtual.pergunta,
            respostaUsuario: respostaDoUsuario,
            respostaCorreta: perguntaAtual.resposta,
            correta: correta
        });

        respostasDadas[indiceAtual] = true;
    } else {
        feedbackMessage.textContent = "Você já respondeu esta pergunta.";
        feedbackMessage.className = '';
    }

    const proximoBtn = document.getElementById('botao-proximo');
    if (proximoBtn) {
        proximoBtn.textContent = (indiceAtual === perguntas.length - 1) ? 'Finalizar' : 'Próxima';
        proximoBtn.onclick = proximaPergunta;
    }
}

// Volta uma pergunta
function perguntaAnterior() {
    if (indiceAtual > 0) {
        indiceAtual--;
        carregarPergunta();
    }
}

// Vai para próxima pergunta ou mostra resultado
function proximaPergunta() {
    indiceAtual++;
    if (indiceAtual < perguntas.length) {
        carregarPergunta();
    } else {
        mostrarResultado();
    }
}

//  SALVAR RESULTADO E HISTÓRICO NO FIRESTORE

async function salvarResultadoNoFirebase() {
    const user = auth.currentUser;

    if (!user) {
        console.warn("Usuário não logado, não foi possível salvar o resultado no Firebase.");
        return;
    }

    try {
        // Atualiza/cria o documento do usuário
        const usuarioRef = doc(db, "usuarios", user.uid);
        await setDoc(usuarioRef, {
            nome: nomeUsuario || user.displayName || "Sem nome",
            email: user.email || "",
            atualizadoEm: serverTimestamp()
        }, { merge: true });

        // Subcoleção de histórico
        const historicoRef = collection(db, "usuarios", user.uid, "historicoQuiz");

        await addDoc(historicoRef, {
            nomeUsuario: nomeUsuario,
            acertos: acertos,
            erros: erros,
            totalPerguntas: perguntas.length,
            respostas: historicoRespostas,
            criadoEm: serverTimestamp()
        });

        console.log("Resultado do quiz salvo com sucesso no Firestore.");

    } catch (erro) {
        console.error("Erro ao salvar resultado no Firestore:", erro);
    }
}

// Mostra a tela de resultado
function mostrarResultado() {
    const quiz = document.getElementById("quiz");
    const resultado = document.getElementById("resultado");
    const barra = document.getElementById("barra-progresso");
    const mensagem = document.getElementById("mensagem");
    const contadorAcertos = document.getElementById("contador-acertos");
    const contadorErros = document.getElementById("contador-erros");

    if (quiz) quiz.classList.add("oculto");
    if (resultado) resultado.classList.remove("oculto");
    if (barra) barra.style.width = "100%";

    if (mensagem) {
        mensagem.innerHTML = `
            <h2>Resultado Final, <strong>${nomeUsuario}</strong>!</h2>
            <p>Você completou o quiz de tecnologia!</p>
        `;
    }

    if (contadorAcertos) contadorAcertos.textContent = acertos;
    if (contadorErros) contadorErros.textContent = erros;

    tocarSom(somSucesso, 60);

    // Salva resultado no Firestore
    salvarResultadoNoFirebase();
}

// Reinicia o quiz e volta para tela inicial
function reiniciarQuiz() {
    if (somAcertou) somAcertou.pause();
    if (somErrou) somErrou.pause();
    if (somSucesso) somSucesso.pause();
    if (somDerrota) somDerrota.pause?.();

    const quizPrincipal = document.getElementById("quiz-principal");
    const containerInicio = document.getElementById("container-inicio");
    const nomeInput = document.getElementById("entrada-nome");
    const errorMessage = document.getElementById("mensagem-erro");
    const barra = document.getElementById("barra-progresso");

    if (quizPrincipal) quizPrincipal.classList.add("oculto");
    if (containerInicio) containerInicio.classList.remove("oculto");
    if (nomeInput) nomeInput.value = "";
    if (errorMessage) errorMessage.classList.add("oculto");
    if (nomeInput) nomeInput.classList.remove("entrada-erro");
    if (barra) barra.style.width = "0%";
}


// EXPONDO ALGUMAS FUNÇÕES NO ESCOPO GLOBAL
// (para funcionar com onclick="" no HTML)

window.iniciarQuiz = iniciarQuiz;
window.perguntaAnterior = perguntaAnterior;
window.reiniciarQuiz = reiniciarQuiz;

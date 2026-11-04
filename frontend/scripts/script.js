//url base da API
const API_URL = "https://localhost:8080";

//evento executado automaticamente assim que toda estrutura html for carregada
document.addEventListener("DOMContentLoaded", function(){
    getTask(); // chama a função para listar as tarefas de um usuario logado
});

//função assincrona responsável por buscar e exibir as tarefas do usuário autenticado
async function getTask(){
    //recupera a string do token JWT salva no local storage durante o login
    const token = localStorage.getItem("Authorization");

    if(!token){
        alert("Usuário não autenticado! Faça login para continuar");
        window.location.href = "login.html"; //redireciona imediatamente para a tela de login
        return; //Interrompe a execução
    }

    document.getElementById("Loading").style.display = "block"; //exibe o elemento de carregamento

    try{
        // Envia requisição GET para o endpoint /task passando o token no cabeçalho Authorization
        // ATENÇÃO: Mudado de ' para ` para que ${API_URL} funcione corretamente
        const response = await fetch(`${API_URL}/task`, {
            method: 'GET', //Método HTTP de busca
            headers: {
                'Content-Type': 'application/json', //tipo de requisição
                "Authorization": token //envia o token gravado no localstorage
            }
        });

        // se o token for aceito pela API
        if (response.ok){
            // converte a resposta recebida (taskProjection) em um array javascript
            const tasks = await response.json();

            // Renderiza as tarefas na página
            renderTasks(tasks);
        } else if (response.status === 403 || response.status === 401){ 
            alert("Sessão expirada. Por favor, faça login novamente.");
            logout();
        } else {
            alert("Erro ao buscar tarefas.");
        }
    } catch (error){
        console.error("Erro na busca de tarefas:", error);
        alert("Erro de conexão com o servidor.");
    } finally {
        document.getElementById("Loading").style.display = "none";     
    }
}

function renderTasks(tasks){
    const taskList = document.getElementById("task-list"); //Seleciona o elemento <ul> no DOM
    taskList.innerHTML = ""; // Limpa a lista de tarefas

    if(tasks.length === 0){
        taskList.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma tarefa encontrada.</li>';
        return;
    }

    //percorre cada objeto do tipo TaskProjection (possuindo apenas o id e description)
    tasks.forEach(task => {
        //cria um elemento de lista <li> do bootstrap
        const li = document.createElement("li");     
        li.className = "list-group-item d-flex justify-content-between align-items-center"; // Adiciona classes do Bootstrap

        //define o texto da descrição da tarefa na lista
        li.innerHTML = '<span>${task.description}</span>';

        //adiciona o item a lista principal no HTML
        taskList.appendChild(li);
    })
}

//função responsável por encerrar a sessão do usuario no navegadpr
function logout(){
    //remove a chave 'Authorization' contendo o token do localStorage
    localStorage.removeItem("Authorization");   

    //Redireciona o usuário para a página de login
    window.location.href = "login.html";
}
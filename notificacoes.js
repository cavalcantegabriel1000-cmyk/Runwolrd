/* =====================================================
   RUNWORLD — SISTEMA DE NOTIFICAÇÕES
   API pública integrada ao app.js, sem eventos duplicados.
===================================================== */
(function () {
    "use strict";

    const CHAVE = "runworld-notificacoes";
    let notificacoes = [];
    let proximoId = 1;
    let eventosConfigurados = false;

    function elemento(id) { return document.getElementById(id); }

    function carregar() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
            notificacoes = Array.isArray(dados) ? dados.slice(0, 50) : [];
            proximoId = notificacoes.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        } catch (_) { notificacoes = []; proximoId = 1; }
    }

    function guardar() {
        try { localStorage.setItem(CHAVE, JSON.stringify(notificacoes.slice(0, 50))); }
        catch (erro) { console.warn("Não foi possível guardar as notificações:", erro); }
    }

    function renderizar() {
        const lista = elemento("listaNotificacoes");
        const vazias = elemento("notificacoesVazias");
        if (!lista) return;
        lista.replaceChildren();
        if (vazias) vazias.hidden = notificacoes.length > 0;

        notificacoes.forEach(notificacao => {
            const item = document.createElement("article");
            item.className = "notificacao";
            const icone = document.createElement("div");
            icone.className = "notificacao-icone";
            icone.textContent = notificacao.icone || "🔔";
            const conteudo = document.createElement("div");
            conteudo.className = "notificacao-conteudo";
            const titulo = document.createElement("strong");
            titulo.textContent = notificacao.titulo || "Notificação";
            const mensagem = document.createElement("p");
            mensagem.textContent = notificacao.mensagem || "";
            const data = document.createElement("small");
            data.className = "notificacao-data";
            data.textContent = notificacao.data || "";
            conteudo.append(titulo, mensagem, data);
            item.append(icone, conteudo);
            lista.appendChild(item);
        });
        if (window.lucide?.createIcons) window.lucide.createIcons();
    }

    function abrir() {
        const fundo = elemento("fundoNotificacoes");
        if (!fundo) return;
        fundo.classList.add("aberto", "active");
        fundo.setAttribute("aria-hidden", "false");
        renderizar();
    }

    function fechar() {
        const fundo = elemento("fundoNotificacoes");
        if (!fundo) return;
        fundo.classList.remove("aberto", "active");
        fundo.setAttribute("aria-hidden", "true");
    }

    function adicionar(dados) {
        if (!dados || !dados.titulo) return null;
        const notificacao = {
            id: proximoId++,
            titulo: String(dados.titulo),
            mensagem: String(dados.mensagem || ""),
            icone: String(dados.icone || "🔔"),
            data: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            lida: false
        };
        notificacoes.unshift(notificacao);
        notificacoes = notificacoes.slice(0, 50);
        guardar();
        renderizar();
        return notificacao.id;
    }

    function limpar() { notificacoes = []; guardar(); renderizar(); }

    function configurarEventos() {
        if (eventosConfigurados) return;
        eventosConfigurados = true;
        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape") fechar();
        });
    }

    function iniciar() { carregar(); configurarEventos(); renderizar(); }

    window.RunWorldNotificacoes = {
        abrir,
        fechar,
        adicionar,
        listar: () => notificacoes.map(item => ({ ...item })),
        limpar,
        inicializar: iniciar
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    } else { iniciar(); }
})();

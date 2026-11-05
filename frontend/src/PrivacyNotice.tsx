// TODO: troque pelo e-mail de contato do projeto antes da apresentação.
const CONTATO = 'vempraorlapoa@gmail.com'

export default function PrivacyNotice() {
  return (
    <details className="privacy">
      <summary><i className="bi bi-shield-lock" /> Privacidade e tratamento dos dados</summary>
      <div className="privacy-body">
        <p><strong>Projeto acadêmico.</strong> O Vem Pra Orla é um protótipo desenvolvido como Trabalho de Conclusão de Curso no IFRS Campus Porto Alegre.</p>

        <p><strong>Quais dados usamos</strong></p>
        <ul>
          <li>Seu e-mail e o identificador da sua conta Google, recebidos no login.</li>
          <li>As ocorrências que você registra: tipo, local, descrição, impacto, data e hora, e o vínculo com a sua conta.</li>
          <li>Sua escolha de receber (ou não) o resumo diário por e-mail.</li>
        </ul>

        <p><strong>Para que usamos</strong></p>
        <ul>
          <li>Autenticar você e permitir que só você edite ou exclua as suas ocorrências.</li>
          <li>Calcular o índice de lazer, que considera as ocorrências das últimas 24 horas.</li>
          <li>Enviar o resumo diário por e-mail, <strong>somente se você ativar</strong> essa opção. Você pode desativar quando quiser.</li>
        </ul>
        <p>Não usamos seus dados para publicidade e não os vendemos. As ocorrências aparecem para os demais usuários logados, sem exibir seu nome ou e-mail na tela.</p>

        <p><strong>Quem trata os dados</strong></p>
        <ul>
          <li><strong>Supabase:</strong> banco de dados e autenticação. Segundo o próprio Supabase, ele atua como operador, tratando os dados conforme as instruções do projeto, com criptografia em trânsito e em repouso, e pode transferir alguns dados para os EUA e Singapura com salvaguardas contratuais.</li>
          <li><strong>Google:</strong> login com a sua conta Google e envio dos e-mails.</li>
          <li><strong>Open-Meteo:</strong> fornece a previsão do tempo. Ela recebe apenas as coordenadas da orla, nunca dados de usuários.</li>
          <li><strong>Anthropic (assistente de IA):</strong> processa as perguntas feitas no chat e os dados do sistema usados para responder (clima e ocorrências, sem nome nem e-mail). Evite escrever dados pessoais no chat.</li>
        </ul>

        <p><strong>Seus direitos</strong></p>
        <p>Você pode, a qualquer momento, desativar o resumo por e-mail, editar ou excluir as suas ocorrências aqui no sistema, e pedir acesso, correção ou eliminação dos seus dados, inclusive da sua conta, pelo contato abaixo.</p>
        <p>Contato: <a href={`mailto:${CONTATO}`}>{CONTATO}</a></p>
      </div>
    </details>
  )
}

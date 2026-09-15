// Arquivo: src/pages/Legal/Privacidade/index.jsx
// Modelo de Política de Privacidade. Descreve o que o sistema realmente faz — revise com
// um advogado antes de publicar e mantenha em sincronia quando o sistema mudar.
import DocumentoLegal, { Secao, Lista } from '../../../components/DocumentoLegal';
import { EMPRESA } from '../../../config/legal';

export default function Privacidade() {
  return (
    <DocumentoLegal
      titulo="Política de Privacidade"
      resumo="Como o AltaInteligente trata os dados de profissionais de saúde e de pacientes no acompanhamento pós-operatório, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
    >
      <Secao titulo="1. Quem é responsável pelos dados">
        <p>
          O AltaInteligente é operado por <strong>{EMPRESA.nome}</strong>, CNPJ {EMPRESA.cnpj}, {EMPRESA.endereco}.
        </p>
        <p>
          Os dados dos pacientes são tratados em nome do profissional de saúde ou da clínica que faz o
          atendimento. Esse profissional ou clínica é o <strong>controlador</strong> dos dados do paciente;
          o AltaInteligente atua como <strong>operador</strong>, seguindo as instruções do controlador.
          Em relação aos dados de cadastro dos profissionais, o AltaInteligente é o controlador.
        </p>
      </Secao>

      <Secao titulo="2. Quais dados tratamos">
        <p><strong>Do profissional de saúde:</strong></p>
        <Lista itens={[
          'Nome, e-mail, telefone e especialidade.',
          'Senha, guardada apenas de forma criptografada (hash), nunca em texto legível.',
          'Preferências de notificação e data de aceite dos Termos de Uso.',
          'Registros de acesso: data, hora, endereço IP e ação realizada.',
        ]} />
        <p><strong>Do paciente:</strong></p>
        <Lista itens={[
          'Nome, data de nascimento, telefone e, se informado, e-mail e observações cadastradas pelo profissional.',
          'Procedimento realizado, data do procedimento e protocolo de recuperação.',
          'Check-ins diários: nível de dor, orientações cumpridas, observações escritas e fotos enviadas.',
          'Aceite do termo de privacidade: data, versão, endereço IP e navegador usados no aceite, e a escolha sobre receber lembretes.',
        ]} />
        <p>
          Nível de dor, observações e fotos são <strong>dados pessoais sensíveis</strong> referentes à saúde
          (art. 5º, II, da LGPD) e recebem a proteção reforçada que a lei exige.
        </p>
      </Secao>

      <Secao titulo="3. Para que usamos os dados">
        <Lista itens={[
          'Permitir que o profissional acompanhe a recuperação do paciente depois do procedimento.',
          'Avisar o profissional por e-mail quando um check-in indica dor alta ou piora.',
          'Enviar lembrete diário ao paciente pelo WhatsApp, somente se ele autorizar.',
          'Manter a segurança da plataforma, registrar acessos e investigar uso indevido.',
          'Cumprir obrigações legais e regulatórias e permitir o exercício de direitos em processos.',
        ]} />
      </Secao>

      <Secao titulo="4. Bases legais">
        <Lista itens={[
          'Tutela da saúde, em procedimento realizado por profissionais de saúde (art. 11, II, "f", da LGPD), para o acompanhamento pós-operatório.',
          'Consentimento do paciente (art. 11, I) para o envio de lembretes, que pode ser retirado a qualquer momento.',
          'Execução de contrato (art. 7º, V) para os dados de cadastro do profissional.',
          'Cumprimento de obrigação legal ou regulatória e exercício regular de direitos (art. 7º, II e VI; art. 11, II, "a" e "d").',
        ]} />
      </Secao>

      <Secao titulo="5. Fotos">
        <p>
          As fotos são opcionais. Antes de serem guardadas, são reduzidas e têm os metadados removidos —
          inclusive a localização que o celular grava dentro do arquivo. Só o profissional responsável pelo
          paciente consegue vê-las, por um endereço que expira em 15 minutos.
        </p>
      </Secao>

      <Secao titulo="6. Com quem os dados são compartilhados">
        <Lista itens={[
          'Com o profissional ou a clínica responsável pelo atendimento.',
          'Com prestadores de serviço necessários ao funcionamento da plataforma — hospedagem, envio de e-mail e, quando ativado, a Meta (WhatsApp) — sob contrato e apenas no necessário.',
          'Com autoridades públicas, quando houver obrigação legal ou ordem judicial.',
        ]} />
        <p>Os dados não são vendidos nem usados para publicidade.</p>
      </Secao>

      <Secao titulo="7. Transferência internacional">
        <p>
          Alguns prestadores, como o serviço de WhatsApp, podem processar dados fora do Brasil. Nesses casos,
          a transferência segue as hipóteses do art. 33 da LGPD, com garantias contratuais de proteção.
        </p>
      </Secao>

      <Secao titulo="8. Por quanto tempo guardamos">
        <p>
          Os dados ficam guardados enquanto durar o acompanhamento e pelo prazo em que o profissional ou a
          clínica precisa mantê-los, incluindo a guarda de prontuário exigida pela legislação e pelos conselhos
          profissionais. Depois disso, são eliminados ou anonimizados.
        </p>
      </Secao>

      <Secao titulo="9. Segurança">
        <Lista itens={[
          'Senhas guardadas com hash e limite de tentativas de login.',
          'Cada profissional acessa apenas os próprios pacientes.',
          'Link do paciente com código aleatório longo, que deixa de funcionar quando o tratamento é encerrado.',
          'Registro de quem visualizou, exportou ou anonimizou dados de pacientes.',
          'Conexão criptografada (HTTPS) no ambiente de produção.',
        ]} />
        <p>
          Em caso de incidente de segurança que possa causar risco ou dano relevante, os titulares e a
          Autoridade Nacional de Proteção de Dados (ANPD) serão comunicados, conforme o art. 48 da LGPD.
        </p>
      </Secao>

      <Secao titulo="10. Seus direitos">
        <p>Pelo art. 18 da LGPD, você pode pedir:</p>
        <Lista itens={[
          'Confirmação de que tratamos seus dados e acesso a eles.',
          'Correção de dados incompletos, inexatos ou desatualizados.',
          'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.',
          'Portabilidade dos dados.',
          'Informação sobre com quem os dados foram compartilhados.',
          'Retirada do consentimento para lembretes.',
        ]} />
        <p>
          <strong>Pacientes:</strong> faça o pedido ao profissional ou à clínica que cuida do seu tratamento. A
          plataforma permite que eles exportem e anonimizem seus dados. Algumas informações podem precisar ser
          mantidas pelo prazo legal de guarda de prontuário.
        </p>
        <p>
          <strong>Encarregado de dados:</strong> {EMPRESA.email}. Você também pode reclamar à ANPD.
        </p>
      </Secao>

      <Secao titulo="11. Cookies">
        <p>
          O AltaInteligente não usa cookies de publicidade nem de rastreamento. O navegador guarda apenas a
          sessão do profissional logado, necessária para o sistema funcionar.
        </p>
      </Secao>

      <Secao titulo="12. Alterações">
        <p>
          Quando esta política mudar de forma relevante, a data da versão no topo será atualizada e o novo
          texto será apresentado para aceite no próximo acesso.
        </p>
      </Secao>
    </DocumentoLegal>
  );
}

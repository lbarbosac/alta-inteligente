// Arquivo: src/pages/Legal/Termos/index.jsx
// Modelo de Termos de Uso para profissionais. Revise com um advogado antes de publicar.
import { Link } from 'react-router-dom';
import DocumentoLegal, { Secao, Lista } from '../../../components/DocumentoLegal';
import { EMPRESA } from '../../../config/legal';

export default function Termos() {
  return (
    <DocumentoLegal
      titulo="Termos de Uso"
      resumo="Regras de uso do AltaInteligente por profissionais de saúde e clínicas, incluindo as responsabilidades de cada parte no tratamento dos dados dos pacientes."
    >
      <Secao titulo="1. Aceite">
        <p>
          Estes termos regulam o uso da plataforma AltaInteligente, operada por {EMPRESA.nome}, CNPJ {EMPRESA.cnpj}.
          Ao aceitá-los, o profissional declara que leu e concorda com eles e com a{' '}
          <Link to="/privacidade" className="underline underline-offset-2">Política de Privacidade</Link>.
        </p>
      </Secao>

      <Secao titulo="2. O que é o serviço">
        <p>
          O AltaInteligente é uma ferramenta de apoio ao acompanhamento pós-operatório: organiza protocolos de
          recuperação, recebe check-ins dos pacientes e sinaliza situações que pedem atenção.
        </p>
        <p>
          <strong>A plataforma não faz diagnóstico, não prescreve e não substitui a avaliação clínica.</strong>{' '}
          Os alertas são sinais para o profissional avaliar. As mensagens automáticas (e-mail e WhatsApp) podem
          atrasar ou falhar e não devem ser o único canal para situações de urgência.
        </p>
      </Secao>

      <Secao titulo="3. Responsabilidades do profissional">
        <Lista itens={[
          'Cadastrar dados corretos dos pacientes e manter a senha em sigilo.',
          'Definir e revisar o conteúdo clínico dos protocolos e orientações.',
          'Avaliar os check-ins e alertas recebidos e orientar o paciente sobre como agir em urgência.',
          'Informar o paciente sobre o uso da plataforma e atender os pedidos dele sobre dados pessoais.',
          'Guardar o prontuário pelo prazo exigido pela legislação e pelo seu conselho profissional.',
          'Respeitar o sigilo profissional e as normas éticas da sua profissão.',
        ]} />
      </Secao>

      <Secao titulo="4. Tratamento de dados dos pacientes">
        <p>
          Em relação aos dados dos pacientes, o profissional ou a clínica é o <strong>controlador</strong> e o
          AltaInteligente é o <strong>operador</strong> (LGPD, art. 5º, VI e VII). O AltaInteligente se compromete a:
        </p>
        <Lista itens={[
          'Tratar os dados apenas para prestar o serviço e conforme as instruções do controlador.',
          'Manter medidas de segurança técnicas e administrativas adequadas.',
          'Registrar acessos a dados de pacientes e disponibilizar exportação e anonimização.',
          'Comunicar o controlador sobre incidentes de segurança que envolvam seus pacientes.',
          'Contratar apenas prestadores que ofereçam garantias de proteção compatíveis.',
        ]} />
      </Secao>

      <Secao titulo="5. Uso proibido">
        <Lista itens={[
          'Cadastrar pacientes sem relação de atendimento com o profissional.',
          'Compartilhar o acesso com terceiros não autorizados.',
          'Inserir conteúdo ilegal, ofensivo ou que viole direitos de terceiros.',
          'Tentar acessar dados de outros profissionais ou burlar a segurança da plataforma.',
        ]} />
      </Secao>

      <Secao titulo="6. Disponibilidade e suspensão">
        <p>
          O serviço pode passar por manutenções e instabilidades. O acesso pode ser suspenso em caso de
          violação destes termos ou por determinação legal.
        </p>
      </Secao>

      <Secao titulo="7. Encerramento">
        <p>
          Ao encerrar o uso, o profissional pode exportar os dados dos seus pacientes. Os dados são mantidos pelo
          prazo legal aplicável e depois eliminados ou anonimizados.
        </p>
      </Secao>

      <Secao titulo="8. Alterações e legislação">
        <p>
          Estes termos podem ser atualizados; mudanças relevantes serão apresentadas para novo aceite. Aplica-se a
          legislação brasileira. Contato: {EMPRESA.email}.
        </p>
      </Secao>
    </DocumentoLegal>
  );
}

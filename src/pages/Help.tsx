import { FiHelpCircle, FiMail, FiBookOpen } from "react-icons/fi";

export default function Help() {
  return (
    <div className="max-w-5xl bg-principal-white rounded shadow p-6 font-sans">
      <h2 className="text-xl font-semibold mb-6 text-principal-blue">
        Ajuda & Suporte
      </h2>

      {/* COMO COMEÇAR */}
      <section className="mb-10">
        <h3 className="text-lg font-medium mb-4 text-principal-blue">
          Como começar
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Cadastrar clientes",
              description:
                "Registre seus clientes para iniciar inspeções e gerar relatórios.",
            },
            {
              title: "Criar inspeções",
              description:
                "Associe inspeções aos clientes e acompanhe o andamento.",
            },
            {
              title: "Gerar relatórios",
              description:
                "Emita relatórios técnicos após concluir uma inspeção.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border rounded p-4 transition"
            >
              <p className="font-medium text-text-default mb-1">
                {item.title}
              </p>
              <p className="text-sm text-text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h3 className="text-lg font-medium mb-4 text-principal-blue">
          Dúvidas frequentes
        </h3>

        <div className="space-y-3">
          {[
            {
              q: "Posso editar um cliente depois de cadastrado?",
              a: "Sim. Você pode editar os dados do cliente a qualquer momento.",
            },
            {
              q: "Quem pode visualizar os relatórios?",
              a: "Apenas usuários com permissão adequada terão acesso.",
            },
            {
              q: "Consigo alterar os dados da empresa?",
              a: "Sim. A aba 'Minha empresa' permite atualizar essas informações.",
            },
          ].map((item, index) => (
            <div key={index} className="border rounded p-4">
              <p className="font-medium text-text-default mb-1">
                {item.q}
              </p>
              <p className="text-sm text-text-secondary">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPORTE */}
      <section>
        <h3 className="text-lg font-medium mb-4 text-principal-blue">
          Precisa de ajuda?
        </h3>

        <div className="flex items-center gap-4 border rounded p-4">
          <FiMail className="text-principal-blue" size={20} />
          <div>
            <p className="font-medium text-text-default">
              Fale com o suporte
            </p>
            <p className="text-sm text-text-secondary">
              Entre em contato pelo e-mail{" "}
              <span className="text-principal-blue">
                suporte@engenhariamaas.com.br
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
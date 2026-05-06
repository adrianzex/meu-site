import { useEffect, useState } from "react";

const Popup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl text-center max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-4">
          Bem-vinda ✨
        </h2>

        <p className="text-gray-600 mb-6">
          Informamos que a opção pix no site, esta sendo testada, e pode apresentar instabilidades, para evitar transtornos, recomendamos que entre em contato conosco via whatsapp para realizar seu pedido, ou aguarde a correção do problema.

          Aproveite para conhecer nossos produtos e promoções, e entre em contato para tirar dúvidas ou fazer seu pedido! Estamos ansiosos para atendê-la!✨
        </p>

        <button
          onClick={() => setOpen(false)}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default Popup;
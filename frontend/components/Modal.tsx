import React from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// Componente de Modal simples em React, para trabalhar a sugestão de plano de forma interativa, permitindo ao usuário fechar o modal ao clicar fora dele ou em um botão de fechar. Utilizei essa abordagem inspirado em ferramentas de inteligência de catálogo.
export default function ReactModal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            minWidth: 300,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
        >
        <h1 style={{ fontSize: 24 }}>Encontre o melhor plano para você</h1>
        {children}
      </div>
    </div>
  );
}

import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  text?:  Array<string> | string;
}

function Button({ children,text, onClick,className, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="
        mt-6 px-6 py-3 rounded-2xl bg-mint
        text-darkgreen font-semibold shadow-md
        hover:bg-darkgreen hover:text-white
        transition cursor-pointer
      "
    >
      {children}{text}
    </button>
  );
}

export default Button;

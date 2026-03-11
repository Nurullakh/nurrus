import React from "react";
import { useFormContext } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

const InputField: React.FC<InputProps> = ({ name, label, type = "text", placeholder }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        className={`border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
          errors[name] ? "border-[#4b8839]" : "border-gray-300"
        }`}
      />
      {errors[name] && (
        <p className="text-[#4b8839] text-sm mt-1">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};

export default InputField;

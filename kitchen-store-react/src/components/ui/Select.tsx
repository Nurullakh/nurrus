import React from "react";
import { useFormContext } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ name, label, options, placeholder }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        defaultValue={placeholder ? "" : options[0]?.value || ""}
        {...register(name)}
        className={
          "border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none " +
          (errors[name] ? "border-[#4b8839]" : "border-gray-300")
        }
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-[#4b8839] text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Select; 
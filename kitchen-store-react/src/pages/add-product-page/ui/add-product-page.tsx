"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/shared/ui/input-field/input-field";
import ImageUpload from "@/shared/ui/image-upload/image-upload";
import { useCreateProductMutation } from "@/entities/product/api/products-api";
import { extractApiErrorMessage } from "@/shared/lib/error/extract-api-error";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  name: yup.string().required("Название обязательно"),
  description: yup.string().required("Описание обязательно"),
  price: yup.number().typeError("Должно быть число").required("Цена обязательна"),
  category: yup.string().required("Категория обязательна"),
  brand: yup.string().required("Бренд обязателен"),
  specifications: yup.string().required("Характеристики обязательны"),
  rating: yup.number().optional(),
  reviews_count: yup.number().optional(),
  is_available: yup.boolean().optional(),
});

type AddProductFormValues = {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: string;
  rating?: number;
  reviews_count?: number;
  is_available?: boolean;
};

const AddProduct: React.FC = () => {
  const router = useRouter();
  const methods = useForm<AddProductFormValues>({ resolver: yupResolver(schema) });
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(files);
  };

  const onSubmit = async (data: AddProductFormValues) => {
    try {
      setErrorMessage(null);
      setStatusMessage(null);
      // Создаем FormData для отправки файлов
      const formData = new FormData();

      // Добавляем текстовые поля товара
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      formData.append('brand', data.brand);
      formData.append('specifications', data.specifications);

      // Добавляем изображения
      selectedImages.forEach(file => {
        formData.append('images', file);
      });

      await createProduct(formData).unwrap();

      setStatusMessage("Товар успешно добавлен");
      methods.reset(); // Очистка формы
      setSelectedImages([]); // Очистка выбранных изображений
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, "Ошибка при добавлении товара"));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Добавить товар</h2>
        {statusMessage && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <InputField name="name" label="Название" placeholder="Введите название" />
            <InputField name="description" label="Описание" placeholder="Введите описание" />
            <InputField name="price" label="Цена" type="number" placeholder="Введите цену" />
            <InputField name="category" label="Категория" placeholder="Введите категорию" />
            <InputField name="brand" label="Бренд" placeholder="Введите бренд" />
            <InputField name="specifications" label="Характеристики (JSON)" placeholder='{"key": "value"}' />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображения товара
              </label>
              <ImageUpload onFilesChange={handleImagesChange} maxFiles={10} />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? "Добавление..." : "Добавить товар"}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddProduct;
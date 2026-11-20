import { useState, type ChangeEvent } from 'react';

export function useFormFields<T extends Record<string, string>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setField = <K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const reset = (nextValues: T = initialValues) => {
    setValues(nextValues);
  };

  return { values, handleChange, setField, reset };
}
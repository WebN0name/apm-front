import { useState } from "react";
import axios from "axios";
import Popup from "@/app/base-components/Popup";

interface CreateEmployeePopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  companyId: string;
  handleEployeeCreate: () => void;
}

export default function CreateEmployeePopup({ isOpen, setIsOpen, companyId, handleEployeeCreate }: CreateEmployeePopupProps) {
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    position: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    surName: "",
    email: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    let valid = true;
    const newErrors = { firstName: "", surName: "", email: "", position: "" };

    if (!form.firstName.trim()) {
      newErrors.firstName = "Введите имя";
      valid = false;
    }
    if (!form.surName.trim()) {
      newErrors.surName = "Введите фамилию";
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "Введите email";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Некорректный email";
      valid = false;
    }
    if (!form.position.trim()) {
      newErrors.position = "Введите должность";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        firstName: form.firstName,
        surName: form.surName,
        email: form.email,
        companyId,
        position: form.position,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` }
      }
    );

      setIsOpen(false);
      setForm({ firstName: "", surName: "", email: "", position: "" });
      handleEployeeCreate()

    } catch (err) {
      setSubmitError("Ошибка при создании пользователя.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup isOpenPopup={isOpen} setIsOpenPopup={setIsOpen}>
      <h2 className="text-xl font-bold mb-4">Добавить пользователя</h2>

      {submitError && <p className="text-red-500">{submitError}</p>}

      <div className="mb-2">
        <input
          type="text"
          name="firstName"
          placeholder="Имя"
          value={form.firstName}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.firstName ? "border-red-500" : ""}`}
        />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
      </div>

      <div className="mb-2">
        <input
          type="text"
          name="surName"
          placeholder="Фамилия"
          value={form.surName}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.surName ? "border-red-500" : ""}`}
        />
        {errors.surName && <p className="text-red-500 text-sm">{errors.surName}</p>}
      </div>

      <div className="mb-2">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="mb-4">
        <input
          type="text"
          name="position"
          placeholder="Должность"
          value={form.position}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.position ? "border-red-500" : ""}`}
        />
        {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          Отмена
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
        >
          {loading ? "Добавление..." : "Добавить"}
        </button>
      </div>
    </Popup>
  );
}
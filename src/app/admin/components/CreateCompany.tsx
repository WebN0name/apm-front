import Popup from "@/app/base-components/Popup";
import React, { useState } from "react";

interface CreateCompanyProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void
    onCreate: (name: string) => void;
}

const CreateCompany: React.FC<CreateCompanyProps> = ({ isOpen, onClose, onCreate }) => {
    const [newCompanyName, setNewCompanyName] = useState("");

    const handleCreateCompany = () => {
        if (newCompanyName) {
            onCreate(newCompanyName);
            setNewCompanyName("");
            onClose(false);
        }
    };


    return (
        <Popup isOpenPopup={isOpen} setIsOpenPopup={onClose}>
            <h3 className="text-lg text-black font-semibold mb-4">Создать компанию</h3>
            <input
                type="text"
                className="border text-black border-gray-300 p-2 rounded-md w-full mb-4"
                placeholder="Название компании"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
                <button
                    onClick={() => onClose(false)}
                    className="bg-red-400 py-2 px-4 rounded-md hover:bg-red-400 cursor-pointer"
                >
                    Закрыть
                </button>
                <button
                    onClick={handleCreateCompany}
                    className="bg-blue-500 py-2 px-4 rounded-md hover:bg-blue-600 cursor-pointer"
                >
                    Добавить
                </button>
            </div>
        </Popup>
    );
};

export default CreateCompany;
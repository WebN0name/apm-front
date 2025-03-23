import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Popup from "@/app/base-components/Popup";

type AddEmployeePopupProps = {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    companyId: string;
    onAttach: (employeeId: string, position: string) => Promise<void>;
};

const AddEmployee = ({ isOpen, onClose, companyId, onAttach }: AddEmployeePopupProps) => {
    const [excludeEmployees, setExcludeEmployees] = useState<Employee[]>([]);
    const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
    const [total, setTotal] = useState(0);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [position, setPosition] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    const fetchEmployees = useCallback(async () => {
        if (isLoading || hasFetched.current) return;
        hasFetched.current = true;

        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees/${companyId}/not-in`, {
                params: { limit: pagination.limit, offset: pagination.offset },
                headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` },
            });

            setTotal(response.data.total);
            setExcludeEmployees((prev) => [...prev, ...response.data.data]);
        } catch (error) {
            console.error("Ошибка получения данных", error);
        } finally {
            setIsLoading(false);
            hasFetched.current = false;
        }
    }, [pagination, companyId, isLoading]);

    useEffect(() => {
        if (!isOpen) {
            setExcludeEmployees([]);
            setPagination({ limit: 10, offset: 0 });
            setSelectedEmployee(null);
            setPosition("");
            hasFetched.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) fetchEmployees();
    }, [pagination, isOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && excludeEmployees.length < total && !isLoading) {
                    setPagination((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                    }));
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [excludeEmployees, total, isLoading]);

    const handleSubmit = async () => {
        if (!selectedEmployee || !position) return;
        await onAttach(selectedEmployee.id, position);
        onClose(false);
        setSelectedEmployee(null);
        setPosition("");
    };

    if (!isOpen) return null;

    return (
        <Popup isOpenPopup={isOpen} setIsOpenPopup={onClose}>
            <h3 className="text-lg text-black font-semibold mb-4">Выберите сотрудника для добавления</h3>
            <div className="border border-black rounded-md p-1">
                <span>
                    {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.surName}` : "Выберите сотрудника"}
                </span>
            </div>
            <div className="flex max-h-[150px] flex-col overflow-y-auto">
                {excludeEmployees.map((employee) => (
                    <span
                        key={employee.id}
                        onClick={() => setSelectedEmployee(employee)}
                        className="cursor-pointer text-lg hover:bg-gray-200 px-3"
                    >
                        {employee.firstName} {employee.surName}
                    </span>
                ))}
                <div ref={ref} className="h-1"></div>
            </div>
            <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Введите должность"
                className="w-full border rounded-md p-2 mt-3"
            />
            <div className="flex justify-end space-x-2 mt-3">
                <button onClick={() => onClose(false)} className="bg-red-400 py-2 px-4 rounded-md hover:bg-red-500 cursor-pointer">
                    Закрыть
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 py-2 px-4 rounded-md hover:bg-blue-600 cursor-pointer"
                    disabled={!selectedEmployee || !position}
                >
                    Добавить
                </button>
            </div>
        </Popup>
    );
};

export default AddEmployee;
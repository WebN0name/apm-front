import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import CreateEmployeePopup from "./CreateEmployee";
import UpdateEmployeePopup from "./UpdateEmployee";
import AddEmployee from "./AddEmployee";


type Props = {
    companyId: string;
};

const EmployeeTable = ({ companyId }: Props) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [isPopupCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
    const [isPopupUpdateEmployeeOpen, setIsUpdateEmployeeOpen] = useState(false);
    const [isPopupAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
    const [total, setTotal] = useState(0);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees/${companyId}`, {
                params: { offset: pagination.offset, limit: pagination.limit, search: debouncedSearch },
                headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` }
            });
            setEmployees(data.data);
            setTotal(data.total);


            return data.data;
        } catch (error) {
            console.error("Ошибка загрузки сотрудников:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [companyId, pagination.offset, debouncedSearch]);

    const handleEmployeeCreate = () => {
        fetchEmployees();
    }

    useEffect(() => {
        if (!isPopupUpdateEmployeeOpen) setSelectedEmployee(null)
    }, [isPopupUpdateEmployeeOpen])

    const handleDetachEmployee = async (employeeId: string) => {
        if (!companyId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}/detach`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({ companyId }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при откреплении сотрудника");
            }

            const result = await fetchEmployees();

            console.log({ 1: pagination.offset, 2: result.length })

            if (pagination.offset !== 0 && result.length === 0) {
                setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };

    const handleAttachEmployee = async (employeeId: string, position: string) => {
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}/attach`,
                { companyId, position },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` } }
            );
            fetchEmployees()
        } catch (error) {
            console.error("Ошибка при добавлении сотрудника", error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
                <button
                    onClick={() => setIsCreateEmployeeOpen(true)}
                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                >
                    Создать пользователя
                </button>
                <button
                    onClick={() => setIsAddEmployeeOpen(true)}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                >
                    Добавить пользователя
                </button>
                <CreateEmployeePopup
                    isOpen={isPopupCreateEmployeeOpen}
                    setIsOpen={setIsCreateEmployeeOpen}
                    companyId={companyId}
                    handleEployeeCreate={handleEmployeeCreate}
                />
                {selectedEmployee && (
                    <UpdateEmployeePopup
                        isOpen={isPopupUpdateEmployeeOpen}
                        setIsOpen={setIsUpdateEmployeeOpen}
                        companyId={companyId}
                        handleEmployeeUpdate={handleEmployeeCreate}
                        employee={selectedEmployee}
                    />
                )}
                <AddEmployee
                    isOpen={isPopupAddEmployeeOpen}
                    onClose={setIsAddEmployeeOpen}
                    companyId={companyId}
                    onAttach={handleAttachEmployee}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 w-[200px] text-left">Имя</th>
                            <th className="p-2 w-[200px] text-left">Фамилия</th>
                            <th className="p-2 w-[300px] text-left">Email</th>
                            <th className="p-2 w-[200px] text-left">Должность</th>
                            <th className="p-2 w-[150px]">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length > 0 ? (
                            <>
                                {employees.map((emp, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2">{emp.firstName}</td>
                                        <td className="p-2">{emp.surName}</td>
                                        <td className="p-2 truncate">{emp.email}</td>
                                        <td className="p-2">{emp.position}</td>
                                        <td className="p-2 flex gap-2">
                                            <button className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                                onClick={() => { setSelectedEmployee(emp); setIsUpdateEmployeeOpen(true) }}>
                                                Изменить
                                            </button>
                                            <button className="bg-red-500 text-white px-2 py-1 rounded-md"
                                                onClick={() => handleDetachEmployee(emp.id)}>
                                                Открепить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {Array.from({ length: 10 - employees.length }).map((_, index) => (
                                    <tr key={`empty-${index}`} className="border-b h-12">
                                        <td colSpan={5}></td>
                                    </tr>
                                ))}
                            </>
                        ) : (
                            <>
                                <tr className="border-b h-12">
                                    <td colSpan={5} className="text-center text-gray-500">
                                        Нет сотрудников
                                    </td>
                                </tr>
                                {Array.from({ length: 9 }).map((_, index) => (
                                    <tr key={`empty-${index}`} className="border-b h-12">
                                        <td colSpan={5}></td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    disabled={pagination.offset === 0}
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:opacity-50 mr-4"
                >
                    Назад
                </button>
                <button
                    disabled={pagination.offset + pagination.limit >= total}
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:opacity-50"
                >
                    Вперед
                </button>
            </div>
        </div>
    );
};

export default EmployeeTable;
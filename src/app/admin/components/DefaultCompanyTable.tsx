import { useState, useEffect } from "react";
import axios from "axios";
import { useDebounce } from "use-debounce";

type Props = {
    companyId: string;
};

const DefaultCompanyTable = ({ companyId }: Props) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300);
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

            return data.data
        } catch (error) {
            console.error("Ошибка загрузки сотрудников:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [companyId, pagination.offset, debouncedSearch]);

    const handleDeleteEmployee = async (employeeId: string) => {
        if (!companyId) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` }
            });
            const result = await fetchEmployees();
            if (pagination.offset !== 0 && result.length === 0) {
                setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
            }
        } catch (error) {
            console.error("Ошибка при удалении сотрудника", error);
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
                                        <td className="p-2 flex justify-center">
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded-md"
                                                onClick={() => handleDeleteEmployee(emp.id)}
                                            >
                                                Удалить
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

export default DefaultCompanyTable;

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import axios from "axios";
import CompanyList from "./CompanyList";
import CreateCompany from "./CreateCompany";
import AddCompany from "./AddCompanyPopup";
import { Company } from "@/types/Company";

type SidebarProps = {
    activeCompany: Company | null;
    setActiveCompany: (company: Company) => void;
};


const SidebarComponent = ({activeCompany, setActiveCompany}: SidebarProps) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);


    const [popupCreateCompany, setPopupCreateCompany] = useState<boolean>(false)
    const [popupAddCompany, setPopupAddCompany] = useState<boolean>(false)


    const fetchCompanies = useCallback(async () => {

        if (isLoading) return;

        setIsLoading(true);

        const token = localStorage.getItem("access-token");
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/companies/admin-include`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: pagination.limit, offset: pagination.offset },
                }
            );

            setTotal(response.data.total);

            setCompanies((prev) => {
                return [...prev, ...response.data.data];
            });
        } catch (err) {
            console.error("Ошибка получения данных", err);
        } finally {
            setIsLoading(false);
        }
    }, [pagination]);

    useEffect(() => {
        fetchCompanies();
    }, [pagination]);

    useEffect(() => {
        if (companies.length > 0 && !activeCompany) {
            setActiveCompany(companies[0]);
        }
    }, [companies, activeCompany]);



    const handleCreateCompany = async (name: string) => {
        const token = localStorage.getItem("access-token");
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/companies`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompanies((prev) =>
                [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name))
            );
        } catch (err) {
            console.error("Ошибка создания компании", err);
        }
    };

    const handleAddCompany = async (companyId: string) => {
        const token = localStorage.getItem("access-token");
        try {
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/admins/${companyId}/attach`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(response.data)
            setCompanies((prev) => [...prev, response.data]);
        } catch (err) {
            console.error("Ошибка добавления компании", err);
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        const token = localStorage.getItem("access-token");
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/admins/${companyId}/detach`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompanies((prev) => prev.filter((company) => company.id !== companyId));
        } catch (err) {
            console.error("Ошибка удаления компании", err);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && companies.length < total && !isLoading) {
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
    }, [companies, total, isLoading]);

    return (
        <div className="w-96 bg-gray-800 text-white p-4">
            <div className="flex justify-between space-x-4">
                <button
                    className="bg-blue-500 py-1 px-3 rounded-md hover:bg-blue-600"
                    onClick={() => setPopupCreateCompany(true)}
                >
                    Создать компанию
                </button>
                <button
                    className="bg-green-500 py-1 px-3 rounded-md hover:bg-green-600"
                    onClick={() => setPopupAddCompany(true)}
                >
                    Добавить компанию
                </button>
            </div>
            <CreateCompany
                isOpen={popupCreateCompany}
                onClose={setPopupCreateCompany}
                onCreate={handleCreateCompany}
            />
            <AddCompany
                isOpen={popupAddCompany}
                onClose={setPopupAddCompany}
                onAttach={handleAddCompany}
            />
            <div className="mt-8">
                <h2 className="text-lg text-center font-semibold mb-2">Компании</h2>
                <div className={`max-h-[500px] ${companies.length >= 10 && 'overflow-y-auto'} pr-4`}>
                    <CompanyList
                        companies={companies}
                        onDelete={handleDeleteCompany}
                        activeCompany={activeCompany} 
                        setActiveCompany={setActiveCompany}
                    />
                    <div ref={ref} ></div>
                </div>
            </div>
        </div>
    );
};

export default SidebarComponent;
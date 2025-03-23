import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Popup from "@/app/base-components/Popup";
import { Company } from "@/types/Company";

type AddCompanyPopupProps = {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onAttach: (companyId: string) => void;
};

const AddCompany = ({ isOpen, onClose, onAttach }: AddCompanyPopupProps) => {
    const [excludeCompanies, setExcludeCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
    const [total, setTotal] = useState(0);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    const fetchCompanies = useCallback(async () => {
        if (isLoading || hasFetched.current) return;
        hasFetched.current = true;

        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/companies/admin-exclude`, {
                params: { limit: pagination.limit, offset: pagination.offset },
                headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` },
            });

            setTotal(response.data.total);

            setExcludeCompanies((prev) => {
                return [...prev, ...response.data.data];
            });
        } catch (error) {
            console.error("Ошибка получения данных", error);
        } finally {
            setIsLoading(false);
            hasFetched.current = false;
        }
    }, [pagination]);

    useEffect(() => {
        if (!isOpen) {
            setExcludeCompanies([]);
            setPagination({ limit: 10, offset: 0 });
            hasFetched.current = false;
        }
    }, [isOpen]);


    useEffect(() => {
        if (isOpen) fetchCompanies();
    }, [pagination, isOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && excludeCompanies.length < total && !isLoading) {
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
    }, [excludeCompanies, total, isLoading]);

    if (!isOpen) return null;

    return (
        <Popup isOpenPopup={isOpen} setIsOpenPopup={onClose}>
            <h3 className="text-lg text-black font-semibold mb-4">Выберите компанию для добавления</h3>
            <div className="boarder border-1 border-black rounded-md p-1">
                <span>{selectedCompany?.name ?? "Выберите компанию"}</span>
            </div>
            <div className="flex max-h-[150px] flex-col overflow-y-auto">
                {excludeCompanies.map((company: Company) => (
                    <span key={company.id} onClick={() => setSelectedCompany(company)} className="cursor-pointer text-lg hover:bg-gray-200 px-3">
                        {company.name}
                    </span>
                ))}
                <div ref={ref} className="h-1"></div>
            </div>
            <div className="flex justify-end space-x-2 mt-3">
                <button
                    onClick={() => { onClose(false); setSelectedCompany(null) }}
                    className="bg-red-400 py-2 px-4 rounded-md hover:bg-red-400 cursor-pointer"
                >
                    Закрыть
                </button>
                <button
                    onClick={() => {
                        if (!selectedCompany) return

                        onAttach(selectedCompany.id)
                        setSelectedCompany(null)
                        onClose(false)
                    }}
                    className="bg-blue-500 py-2 px-4 rounded-md hover:bg-blue-600 cursor-pointer"
                >
                    Добавить
                </button>
            </div>
        </Popup>
    );
};

export default AddCompany;
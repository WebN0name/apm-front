import { Company } from "@/types/Company";
import { Trash2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";


type CompanyListProps = {
  companies: Company[];
  onDelete: (companyId: string) => void;
  activeCompany: Company | null;
  setActiveCompany: (company: Company) => void;
};

const CompanyList = ({ companies, onDelete, activeCompany, setActiveCompany}: CompanyListProps) => {

  const debouncedSetActiveCompany = useDebouncedCallback((company: Company) => {
    setActiveCompany(company);
  }, 300);

  if (companies.length === 0) {
    return <div className="text-center text-gray-500">Компании не найдены</div>;
  }

  return (
    <ul className="space-y-2">
      {companies.map((company) => (
        <li
          key={company.id}
          className={`rounded-md cursor-pointer flex items-center justify-between px-2 transition-colors 
            ${activeCompany?.id === company.id ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"}
          `}
          onClick={() => debouncedSetActiveCompany(company)}
        >
          <span className="leading-[40px] py-1">{company.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(company.id);
            }}
            className="text-red-500 hover:text-red-700 ml-2"
            aria-label="Удалить компанию"
          >
            <Trash2 />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CompanyList;
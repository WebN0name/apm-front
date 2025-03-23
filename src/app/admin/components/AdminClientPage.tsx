"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SidebarComponent from "./Sidebar";
import { Company } from "@/types/Company";
import CreatedCompanyTable from "./CreatedCompanyTable";
import DefaultCompanyTable from "./DefaultCompanyTable";

export default function AdminPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [activeCompany, setActiveCompany] = useState<Company | null>(null);


    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center flex-col">
                <p className="text-xl text-gray-500 mb-4">Вы не авторизованы</p>
                <button
                    onClick={() => router.push("/login")}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                    Войти
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <div className="w-96 bg-gray-800 text-white">
                <SidebarComponent activeCompany={activeCompany} setActiveCompany={setActiveCompany} />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between bg-gray-800 text-white p-4">
                    <span className="text-xl">{user.email}</span>
                    <button
                        onClick={async () => {
                            await logout();
                            router.push("/login");
                        }}
                        className="bg-red-500 py-2 px-4 rounded-md hover:bg-red-600"
                    >
                        Выйти
                    </button>
                </div>

                <div className="flex-1 flex justify-center items-center">
                    {activeCompany?.status === 'created' && <CreatedCompanyTable companyId={activeCompany.id}/>}
                    {activeCompany?.status === 'default' && <DefaultCompanyTable companyId={activeCompany.id}/>}
                </div>
            </div>
        </div>
    );
}
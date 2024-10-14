"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useReports } from '@/contexts/ReportsContext';
import { Register } from '@/types';
import EvidenceHistory from '@/components/EvidenceHistory';

const Page: React.FC = () => {
  const router = useRouter();
  const { reports, setReports } = useReports();
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState<Register[]>([]);
  const [reportsFetched, setReportsFetched] = useState(false);

  const getEmailFromLocalStorage = () => {
    const email = localStorage.getItem('email');
    if (!email) {
      throw new Error('Email not found in localStorage');
    }
    return email;
  };

  const fetchUserIdByEmail = async (email: string) => {
    const response = await fetch(`/api/userByEmail/${email}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user ID');
    }
    const data = await response.json();
    if (!data.id) {
      throw new Error('User ID not found');
    }
    return data.id;
  };

  const fetchReportsByUserId = async (userId: string) => {
    const response = await fetch(`/api/user/${userId}/reports?timestamp=${new Date().getTime()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  };

  useEffect(() => {
    const filterReportsByUser = async () => {
      try {
        const email = getEmailFromLocalStorage();
        const userId = await fetchUserIdByEmail(email);
        const reportsData = await fetchReportsByUserId(userId);
        setUserReports(reportsData);
        setReportsFetched(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!reportsFetched || reports.length !== userReports.length) {
      filterReportsByUser();
    } else {
      setLoading(false);
    }
  }, [reports, userReports.length, reportsFetched]);

  const handleButtonClick = () => {
    router.push('/create-evidence');
  };

  return (
    <Layout>
      <div className="flex flex-col h-full justify-between">
        {/* Main Content */}
        <div className="flex flex-col items-start w-full pl-5">
          <h1 className="text-2xl font-bold text-left">Evidencias</h1>
        </div>

        {/* Centered Text and Button */}
        <div className="flex flex-col flex-grow justify-center items-center text-center px-4">
          {loading ? (
            <span className="text-[#6C7976] text-lg">Cargando...</span>
          ) : userReports.length === 0 ? (
            <>
              <span className="text-[#6C7976] text-lg">
                Todo bien por aquí, no tienes ninguna evidencia aprobada :)
              </span>
              <button
                className="w-64 py-2 mt-4 bg-[#6ABDA6] text-white font-semibold rounded-lg hover:bg-[#5FAD9A]"
                onClick={handleButtonClick}
              >
                Solicitar Evidencia
              </button>
            </>
          ) : (
            <EvidenceHistory reports={userReports} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Page;
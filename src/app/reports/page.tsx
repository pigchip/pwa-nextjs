"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import EvidenceHistory from './history/page';
import { useReports } from '@/contexts/ReportsContext';

const Page: React.FC = () => {
  const router = useRouter();
  const { reports, setReports } = useReports();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Step 1: Get the email from localStorage
        const email = localStorage.getItem('email');
        if (!email) {
          throw new Error('Email not found in localStorage');
        }
  
        // Step 2: Fetch the user ID using the email
        const userIdResponse = await fetch(`/api/userByEmail/${email}`);
        if (!userIdResponse.ok) {
          throw new Error('Failed to fetch user ID');
        }
        const userIdData = await userIdResponse.json();
        const userId = userIdData.id;
        if (!userId) {
          throw new Error('User ID not found');
        }
  
        // Step 3: Fetch the reports using the user ID
        const reportsResponse = await fetch(`/api/user/${userId}/reports`);
        if (!reportsResponse.ok) {
          throw new Error('Failed to fetch reports');
        }
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
  
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch reports only if they are not already loaded
    if (reports.length === 0) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [reports, setReports]);

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
          ) : reports.length === 0 ? (
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
            <EvidenceHistory />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Page;
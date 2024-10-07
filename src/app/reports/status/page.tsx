import EvidenceRequestStatus from "@/components/EvidenceRequestStatus";
import Layout from "@/components/Layout";
import React from "react";

const Page: React.FC = () => {
  return (
    <Layout>
      <EvidenceRequestStatus status="sent" />
    </Layout>
  );
};

export default Page;

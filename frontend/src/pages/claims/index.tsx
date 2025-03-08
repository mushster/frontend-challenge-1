import { Container, Title, Divider } from "@mantine/core";
import ClaimsUpload from "../../components/claims/ClaimsUpload";
import ClaimsTable from "../../components/claims/ClaimsTable";

export default function ClaimsApprovalPage() {
  return (
    <Container size="xl" className="py-8">
      <Title order={2} className="mb-6">Claims Management</Title>
      
      <ClaimsUpload />
      
      <Divider className="my-6" />
      
      <div className="h-[600px]">
        <ClaimsTable />
      </div>
    </Container>
  );
} 
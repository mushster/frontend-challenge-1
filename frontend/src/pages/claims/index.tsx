import { Container, Title, Paper, } from "@mantine/core";
import ClaimsUpload from "../../components/claims/ClaimsUpload";
import ClaimsTable from "../../components/claims/ClaimsTable";

export default function ClaimsApprovalPage() {
  return (
    <Container size="xl" className="py-6">
      <Title order={2} className="mb-4">Claims Management</Title>
      
      <div className="grid grid-cols-1 gap-6 m-4">
        <Paper shadow="xs" p="md" withBorder>
          <ClaimsUpload />
        </Paper>
        
        <Paper shadow="xs" p="md" withBorder className="h-[650px] flex flex-col">
          <ClaimsTable />
        </Paper>
      </div>
    </Container>
  );
}
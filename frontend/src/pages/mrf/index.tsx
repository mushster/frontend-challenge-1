import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { 
  Container, 
  Title, 
  Paper, 
  Table, 
  Button, 
  Group, 
  Text, 
  Badge, 
  Loader, 
  Alert, 
  Modal 
} from "@mantine/core";
import { IconFile, IconDownload, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import mrfStore from "../../stores/mrfStore";
import claimsStore from "../../stores/claimsStore";

const MrfFilesPage = observer(() => {
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    mrfStore.fetchMrfFiles();
  }, []);

  const handleGenerateMrf = async () => {
    if (claimsStore.savedClaims.length === 0 || claimsStore.claimsUsedForMrf) {
      return;
    }

    setGenerating(true);
    const success = await mrfStore.generateMrfFile(claimsStore.savedClaims);
    setGenerating(false);
    
    if (success) {
      setGenerationSuccess(true);
      setTimeout(() => {
        setGenerateModalOpen(false);
        setGenerationSuccess(false);
      }, 2000);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    setDownloadingFileId(fileId);
    await mrfStore.downloadMrfFile(fileId);
    setDownloadingFileId(null);
  };

  return (
    <Container size="xl" className="py-6">
      <Modal
        opened={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title={generationSuccess ? "" : "Generate MRF File"}
        centered
      >
        {generationSuccess ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <IconCheck size={50} color="#00dd7c" stroke={2} />
            <Text size="lg" fw={500}>MRF file generated successfully!</Text>
            <Button 
              onClick={() => {
                setGenerateModalOpen(false);
                setGenerationSuccess(false);
              }} 
              color="green" 
              mt="md"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <Text className="mb-6">
              This will generate a new MRF file based on your approved claims data.
            </Text>
            
            {claimsStore.savedClaims.length === 0 ? (
              <Alert color="yellow" title="No Claims Data" icon={<IconAlertCircle size={16} />}>
                You don't have any approved claims data. Please approve claims before generating an MRF file.
              </Alert>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Found {claimsStore.savedClaims.length} approved claims that will be used for MRF generation.
                </Text>
                
                <div className="mt-4">
                  <Text size="sm" fw={500}>What will happen:</Text>
                  <ul className="list-disc pl-6 text-sm mt-2">
                    <li>Claims data will be processed according to CMS guidelines</li>
                    <li>Data will be grouped by procedure codes and providers</li>
                    <li>Allowed amounts will be calculated for each service</li>
                    <li>JSON file will be generated in the required CMS format</li>
                  </ul>
                </div>
              </>
            )}
            
            <Group justify="flex-end" className="mt-6">
              <Button variant="outline" onClick={() => setGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateMrf} 
                loading={generating}
                disabled={claimsStore.savedClaims.length === 0 || claimsStore.claimsUsedForMrf}
                color="green"
                title={claimsStore.claimsUsedForMrf ? "Upload new claims data to generate another MRF file" : ""}
              >
                Generate
              </Button>
            </Group>
          </>
        )}
      </Modal>

      <div className="flex justify-between items-center mb-6">
        <Title order={2}>MRF Files</Title>
        <Button 
          color="green" 
          onClick={() => setGenerateModalOpen(true)}
          disabled={claimsStore.savedClaims.length === 0 || claimsStore.claimsUsedForMrf}
          title={claimsStore.claimsUsedForMrf ? "Upload new claims data to generate another MRF file" : ""}
        >
          Generate New MRF File
        </Button>
      </div>
      
      <Paper shadow="xs" p="md" withBorder>
        {mrfStore.isLoading && !downloadingFileId ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : mrfStore.error ? (
          <Alert color="red" title="Error" icon={<IconAlertCircle size={16} />}>
            {mrfStore.error}
          </Alert>
        ) : mrfStore.mrfFiles.length === 0 ? (
          <div className="py-12 text-center">
            <Text c="dimmed">No MRF files found. Generate your first MRF file.</Text>
          </div>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>File Name</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Created Date</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mrfStore.mrfFiles.map((file) => (
                <Table.Tr key={file.id}>
                  <Table.Td>
                    <Group>
                      <IconFile size={16} />
                      <Text>{file.fileName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{file.plan}</Table.Td>
                  <Table.Td>{file.createdDate}</Table.Td>
                  <Table.Td>{file.fileSize}</Table.Td>
                  <Table.Td>
                    <Badge 
                      color={file.status === "generated" ? "green" : "blue"}
                      variant="light"
                    >
                      {file.status === "generated" ? "Generated" : "Processing"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button 
                      leftSection={<IconDownload size={16} />}
                      variant="subtle" 
                      size="xs"
                      disabled={file.status !== "generated"}
                      loading={downloadingFileId === file.id}
                      onClick={() => handleDownloadFile(file.id)}
                    >
                      Download
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
      
    </Container>
  );
});

export default MrfFilesPage; 
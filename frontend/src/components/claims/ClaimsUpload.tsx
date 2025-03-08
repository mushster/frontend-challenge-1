import { FileInput, Button, Group, Text, Alert, Stack } from "@mantine/core";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import claimsStore from "../../stores/claimsStore";

const ClaimsUpload = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  
  const handleUpload = () => {
    if (file) {
      claimsStore.uploadCSV(file);
    }
  };
  
  return (
    <Stack className="p-4 border rounded-lg bg-white">
      <Text size="lg" fw={600}>
        Upload Claims CSV
      </Text>
      
      <Group align="flex-end">
        <FileInput
          label="Select CSV file"
          placeholder="claims-data.csv"
          value={file}
          onChange={setFile}
          accept=".csv"
          className="flex-grow"
          error={claimsStore.parseError}
          description="Upload a CSV file containing claims data"
          disabled={claimsStore.isUploading}
        />
        
        <Button
          onClick={handleUpload}
          loading={claimsStore.isUploading}
          disabled={!file}
          color="green"
        >
          Upload
        </Button>
      </Group>
      
      {claimsStore.parseError && (
        <Alert color="red" title="Error parsing CSV">
          {claimsStore.parseError}
        </Alert>
      )}
      
      {Object.keys(claimsStore.errors).length > 0 && (
        <Alert color="yellow" title="Validation Errors">
          Some records have validation errors. Please review the table below.
        </Alert>
      )}
      
      {claimsStore.claims.length > 0 && (
        <Text size="sm" className="text-green-600">
          Successfully parsed {claimsStore.claims.length} valid claims.
        </Text>
      )}
    </Stack>
  );
});

export default ClaimsUpload; 
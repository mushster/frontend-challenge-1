import { FileInput, Button, Group, Alert, Progress, Text } from "@mantine/core";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import claimsStore from "../../stores/claimsStore";

const ClaimsUpload = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  
  const handleUpload = async () => {
    if (file) {
      claimsStore.clearAll();
      await claimsStore.uploadCSV(file);
      
      setLastUploadedFile(file.name);
      setFile(null);
    }
  };
  
  return (
    <div className="flex flex-col gap-2 m-1">
      <Group align="flex-end" grow>
        <FileInput
          placeholder="Select a CSV file"
          value={file}
          onChange={setFile}
          accept=".csv"
          error={claimsStore.parseError}
          disabled={claimsStore.isUploading}
          className="flex-grow"
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
      
      {lastUploadedFile && claimsStore.claims.length > 0 && (
        <Text size="xs" c="dimmed" className="mt-1">
          Current data from: {lastUploadedFile}
        </Text>
      )}
      
      {claimsStore.isUploading && (
        <Progress 
          value={100} 
          animated
          className="mt-2"
          color="green"
        />
      )}
      
      {claimsStore.parseError && (
        <Alert color="red" title="Error" className="mt-3">
          {claimsStore.parseError}
        </Alert>
      )}
    </div>
  );
});

export default ClaimsUpload; 
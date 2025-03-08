import { FileInput, Button, Group, Alert, Progress } from "@mantine/core";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import claimsStore from "../../stores/claimsStore";

const ClaimsUpload = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  
  const handleUpload = async () => {
    if (file) {
      // Clear any previous data before uploading
      claimsStore.clearAll();
      await claimsStore.uploadCSV(file);
      
      // Reset file input after upload
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
      
      {claimsStore.claims.length > 0 && !claimsStore.parseError && (
        <Alert color="green" title="Success" className="mt-3">
          Successfully loaded {claimsStore.claims.length} claims
          {Object.keys(claimsStore.errors).length > 0 && 
            ` (${Object.keys(claimsStore.errors).length} with errors)`}
        </Alert>
      )}
    </div>
  );
});

export default ClaimsUpload; 
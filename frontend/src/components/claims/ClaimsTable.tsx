import { observer } from "mobx-react-lite";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, CellEditingStoppedEvent } from "ag-grid-community";
import { useRef, useState, useEffect } from "react";
import { Button, Text, Badge, Group } from "@mantine/core";
import claimsStore, { Claim } from "../../stores/claimsStore";

// Import AG Grid styles in index.tsx or main App component
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

const ClaimsTable = observer(() => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<(Claim & { id: number })[]>([]);
  
  useEffect(() => {
    // Add an id field to each claim for tracking
    setRowData(
      claimsStore.claims.map((claim, index) => ({
        ...claim,
        id: index,
      }))
    );
  }, [claimsStore.claims]);
  
  const columnDefs: ColDef[] = [
    { field: "tin", headerName: "TIN", editable: true },
    { field: "providerName", headerName: "Provider Name", editable: true },
    { field: "npi", headerName: "NPI", editable: true },
    { field: "procedureCode", headerName: "Procedure Code", editable: true },
    { 
      field: "billingCodeType", 
      headerName: "Billing Code Type", 
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["CPT", "HCPCS", "DRG"],
      }
    },
    { 
      field: "negotiatedRate", 
      headerName: "Negotiated Rate", 
      editable: true,
      valueFormatter: (params) => `$${Number(params.value).toFixed(2)}`,
    },
    { field: "effectiveDate", headerName: "Effective Date", editable: true },
    { field: "expirationDate", headerName: "Expiration Date", editable: true },
    { field: "serviceCode", headerName: "Service Code", editable: true },
    { field: "description", headerName: "Description", editable: true },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: any) => {
        const handleDelete = () => {
          claimsStore.deleteClaim(params.value);
        };
        
        return (
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={handleDelete}
          >
            Delete
          </Button>
        );
      }
    },
  ];
  
  const onCellEditingStopped = (event: CellEditingStoppedEvent) => {
    const { id } = event.data;
    const field = event.colDef.field;
    
    if (field && field !== 'id') {
      const updatedValue = { [field]: event.newValue };
      claimsStore.updateClaim(id, updatedValue);
    }
  };
  
  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };
  
  const getRowClass = (params: any) => {
    if (claimsStore.errors[params.data.id]) {
      return "bg-red-50";
    }
    return "";
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <Text size="lg" fw={600}>
          Claims Data
        </Text>
        <Group>
          <Badge color={Object.keys(claimsStore.errors).length > 0 ? "red" : "green"}>
            {Object.keys(claimsStore.errors).length > 0 
              ? `${Object.keys(claimsStore.errors).length} errors` 
              : "All valid"}
          </Badge>
          <Button variant="outline" color="red" onClick={claimsStore.clearAll}>
            Clear All
          </Button>
          <Button 
            color="green" 
            onClick={claimsStore.approveAndExport}
            disabled={Object.keys(claimsStore.errors).length > 0 || rowData.length === 0}
          >
            Approve & Export
          </Button>
        </Group>
      </div>
      
      {rowData.length > 0 ? (
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            rowHeight={48}
            onCellEditingStopped={onCellEditingStopped}
            onGridReady={onGridReady}
            getRowClass={getRowClass}
            animateRows={true}
            stopEditingWhenCellsLoseFocus={true}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md border">
          <Text color="dimmed">No claims data. Upload a CSV file to get started.</Text>
        </div>
      )}
      
      {Object.entries(claimsStore.errors).length > 0 && (
        <div className="mt-4 p-3 border rounded-md bg-red-50">
          <Text size="sm" fw={600} className="mb-2">Validation Errors:</Text>
          {Object.entries(claimsStore.errors).map(([rowIndex, errors]) => (
            <div key={rowIndex} className="mb-2">
              <Text size="sm">Row {parseInt(rowIndex) + 1}:</Text>
              <ul className="list-disc pl-6">
                {errors.map((error, i) => (
                  <li key={i} className="text-xs text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ClaimsTable; 
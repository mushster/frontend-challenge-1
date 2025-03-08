import { observer } from "mobx-react-lite";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, CellEditingStoppedEvent } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import { useRef, useState, useEffect } from "react";
import { Button, Text, Badge, Group, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import claimsStore, { Claim } from "../../stores/claimsStore";

// Import AG Grid styles in index.tsx or main App component
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

const ClaimsTable = observer(() => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<(Claim & { id: number })[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  
  // Debug logs
  console.log("ClaimsTable rendering, claims in store:", claimsStore.claims.length);
  
  useEffect(() => {
    console.log("useEffect triggered, updating rowData with claims:", claimsStore.claims.length);
    
    // Add an id field to each claim for tracking
    const mappedData = claimsStore.claims.map((claim, index) => ({
      ...claim,
      id: index,
    }));
    
    console.log("Mapped data sample:", mappedData.length > 0 ? mappedData[0] : "No data");
    setRowData(mappedData);
    
    // If grid is already initialized, update it
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('rowData', mappedData);
    }
  }, [claimsStore.claims]);
  
  const columnDefs: ColDef[] = [
    { field: "claimId", headerName: "Claim ID", editable: true, width: 150 },
    { field: "subscriberId", headerName: "Subscriber ID", editable: true, width: 150 },
    { field: "memberSequence", headerName: "Member Seq", editable: true, width: 120 },
    { 
      field: "claimStatus", 
      headerName: "Status", 
      editable: true,
      width: 120,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Payable", "Denied", "Partial Deny"],
      }
    },
    { 
      field: "billed", 
      headerName: "Billed", 
      editable: true,
      width: 110,
      valueFormatter: (params) => `$${Number(params.value).toFixed(2)}`,
    },
    { 
      field: "allowed", 
      headerName: "Allowed", 
      editable: true,
      width: 110,
      valueFormatter: (params) => `$${Number(params.value).toFixed(2)}`,
    },
    { 
      field: "paid", 
      headerName: "Paid", 
      editable: true,
      width: 110,
      valueFormatter: (params) => `$${Number(params.value).toFixed(2)}`,
    },
    { field: "serviceDate", headerName: "Service Date", editable: true, width: 130 },
    { field: "paidDate", headerName: "Paid Date", editable: true, width: 130 },
    { field: "groupName", headerName: "Group Name", editable: true, width: 150 },
    { field: "divisionName", headerName: "Division", editable: true, width: 100 },
    { field: "plan", headerName: "Plan", editable: true, width: 180 },
    { field: "procedureCode", headerName: "Procedure", editable: true, width: 120 },
    { field: "providerName", headerName: "Provider Name", editable: true, width: 180 },
    {
      headerName: "Actions",
      field: "id",
      width: 100,
      cellRenderer: (params: any) => {
        return (
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={() => claimsStore.deleteClaim(params.value)}
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
    console.log("Grid ready event fired");
    params.api.sizeColumnsToFit();
    
    // If we already have data when the grid initializes, set it
    if (rowData.length > 0) {
      console.log("Setting row data on grid ready");
      params.api.setGridOption('rowData', rowData);
    }
  };
  
  const getRowClass = (params: any) => {
    if (claimsStore.errors[params.data.id]) {
      return "bg-red-50";
    }
    return "";
  };
  
  const errorCount = Object.keys(claimsStore.errors).length;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <Group>
          <Text size="md" fw={600}>Claims Data</Text>
          {errorCount > 0 && (
            <Badge color="red" variant="light">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </Badge>
          )}
        </Group>
        
        <Group>
          <Button 
            variant="outline" 
            color="red" 
            size="sm"
            onClick={claimsStore.clearAll}
          >
            Clear All
          </Button>
          <Button 
            color="green" 
            size="sm"
            onClick={claimsStore.approveAndExport}
            disabled={errorCount > 0 || rowData.length === 0}
          >
            Approve & Export
          </Button>
        </Group>
      </div>
      
      {rowData.length > 0 ? (
        <div className="ag-theme-alpine w-full h-[500px]">
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
            pagination={true}
            paginationPageSize={20}
            domLayout="normal"
            modules={[ClientSideRowModelModule]}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md border">
          <Text color="dimmed">No claims data. Upload a CSV file to get started.</Text>
        </div>
      )}
      
      {errorCount > 0 && (
        <div className="mt-3">
          <Button 
            variant="subtle" 
            color="red" 
            size="xs"
            onClick={() => setShowErrors(!showErrors)}
            rightSection={showErrors ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          >
            {showErrors ? "Hide Errors" : "Show Errors"} ({errorCount})
          </Button>
          
          <Collapse in={showErrors}>
            <div className="mt-2 p-3 border rounded-md bg-red-50">
              {Object.entries(claimsStore.errors).map(([rowIndex, errors]) => (
                <div key={rowIndex} className="mb-2">
                  <Text size="sm" fw={500}>Row {parseInt(rowIndex) + 1}:</Text>
                  <ul className="list-disc pl-6">
                    {errors.map((error, i) => (
                      <li key={i} className="text-xs text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Collapse>
        </div>
      )}
    </div>
  );
});

export default ClaimsTable; 
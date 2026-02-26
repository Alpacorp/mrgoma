'use client';
import { useRef, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import Responsive from 'datatables.net-responsive-dt';

DataTable.use(DT);
DataTable.use(Responsive);

const DashboardTable = () => {
  const tableRef = useRef<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.dt().ajax.reload();
    }
  }, [searchParams]);

  return (
    <DataTable
      ref={tableRef}
      ajax={async (data: any, callback) => {
        try {
          const params = new URLSearchParams(window.location.search);
          const currentPage = Math.floor(data.start / data.length) + 1;

          params.set('page', currentPage.toString());
          params.set('pageSize', data.length.toString());

          const response = await fetch(`/api/dashboard/tires?${params.toString()}`);
          const result = await response.json();

          callback({
            draw: data.draw,
            data: result.records || [],
            recordsTotal: result.totalCount || 0,
            recordsFiltered: result.totalCount || 0,
          });
        } catch (error) {
          console.error('Error en fetch:', error);
        }
      }}
      className="display nowrap"
      options={{
        responsive: true,
        processing: true,
        searching: false,
        serverSide: true,
        autoWidth: false,
        columns: [
          { data: 'TireId' },
          { data: 'VaultName' },
          { data: 'Brand' },
          { data: 'Model2' },
          { data: 'Size' },
          { data: 'Height' },
          { data: 'Width' },
          { data: 'LoadIndexId' },
          { data: 'speedIndex' },
          { data: 'Patched' },
          { data: 'Tread' },
          { data: 'DOT' },
        ],
      }}
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>Store</th>
          <th>Brand</th>
          <th>Model</th>
          <th>Rin</th>
          <th>Aspect</th>
          <th>Width</th>
          <th>Load</th>
          <th>Speed</th>
          <th>Patched</th>
          <th>Tread</th>
          <th>DOT</th>
        </tr>
      </thead>
    </DataTable>
  );
};

export default DashboardTable;

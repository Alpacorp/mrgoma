'use client';
import { useRef, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import DT, { AjaxData, AjaxResponse } from 'datatables.net-dt';
import DataTable, { DataTableRef } from 'datatables.net-react';
import Responsive from 'datatables.net-responsive-dt';

DataTable.use(DT);
DataTable.use(Responsive);

const DashboardTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.dt()?.ajax.reload();
    }
  }, [searchParams]);

  return (
    <DataTable
      ref={tableRef}
      ajax={(data: any, callback: any) => {
        const d = data as AjaxData;
        const cb = callback as (response: AjaxResponse) => void;
        (async () => {
          try {
            const params = new URLSearchParams(window.location.search);
            const currentPage = Math.floor(d.start / d.length) + 1;

            params.set('page', currentPage.toString());
            params.set('pageSize', d.length.toString());

            const response = await fetch(`/api/dashboard/tires?${params.toString()}`);
            const result = await response.json();

            cb({
              draw: d.draw,
              data: result.records || [],
              recordsTotal: result.totalCount || 0,
              recordsFiltered: result.totalCount || 0,
            });
          } catch (error) {
            console.error('Error en fetch:', error);
          }
        })();
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
          { data: 'Brand' },
          { data: 'VaultName' },
          { data: 'Model2' },
          { data: 'Height' },
          { data: 'Width' },
          { data: 'Size' },
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
          <th>Brand</th>
          <th>Store</th>
          <th>Model</th>
          <th>Width</th>
          <th>Sidewall</th>
          <th>Diameter</th>
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
